'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:music-router');
const createError = require('http-errors');
const Music = require('../model/music.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const musicRouter = module.exports = Router();

musicRouter.post('/api/music', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/music');

  req.body.userID = req.user._id;
  new Music(req.body).save()
    .then( music => res.json(music))
    .catch(next);
});

musicRouter.get('/api/music/:musicId', bearerAuth, function(req, res, next) {
  debug('GET: /api/music/:musicId');

  Music.findById(req.params.musicId)
    .then( music => {
      if (!music) return next(createError(404));
      return res.json(music);
    })
    .catch( err => console.error(err));
});

musicRouter.delete('/api/music/:musicId', function(req, res, next) {
  debug('DELETE: /api/music/:musicId');

  Music.findByIdAndRemove(req.params.musicId)
    .then( () => res.sendStatus(204))
    .catch(next);
});

musicRouter.put('/api/music/:musicId', function(req, res, next) {
  debug('PUT: /api/music/:musicId');

  Music.findByIdAndUpdate(req.params.musicId, req.body, { new: true })
    .then( song => {
      if (!song) return next(createError(404));
      return res.json(song);
    })
    .catch( () => next(createError(404)));
});