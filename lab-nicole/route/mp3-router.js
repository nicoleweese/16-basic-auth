'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const debug = require('debug')('mp3uploader:mp3-router');
const createError = require('http-errors');

const Mp3 = require('../model/mp3files.js');
const Playlist = require('../model/playlist.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const mp3Router = module.exports = new Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = path.join(__dirname, '..', 'data');
const upload = multer({ dest: dataDir });

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

mp3Router.post('/api/playlist/:playlistId/mp3', bearerAuth, upload.single('song'), function(req, res, next) {
  debug('POST: /api/playlist/:playlistId/mp3');

  if(!req.file) next(createError(400, 'file not found'));
  if(!req.file.path) next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Playlist.findById(req.params.playlistId)
    .then( () => s3uploadProm(params))
    .then( s3data => {
      console.log('s3 response:', s3data);

      del([`${dataDir}/*`]);

      let mp3Data = {
        title: req.body.title,
        artist: req.body.artist,
        userID: req.user._id,
        playlistID: req.params.playlistId,
        objectKey: s3data.Key,
        songURI: s3data.Location,
      };
      console.log('mp3 data', mp3Data);

      return new Mp3(mp3Data).save();
    })
    .then( mp3 => res.json(mp3))
    .catch(next);
});