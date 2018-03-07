'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:playlist-router');
const createError = require('http-errors');
const Playlist = require('../model/playlist.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const playlistRouter = module.exports = Router();

playlistRouter.post('/api/playlist', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/playlist');

  req.body.userID = req.user._id;
  new Playlist(req.body).save()
    .then( playlist => res.json(playlist))
    .catch(next);
});

playlistRouter.get('/api/playlist/:playlistId', bearerAuth, function(req, res, next) {
  debug('GET: /api/playlist/:playlistId');

  Playlist.findById(req.params.playlistId)
    .then( playlist => {
      if (!playlist) return next(createError(404));
      return res.json(playlist);
    })
    .catch(next);
});

playlistRouter.delete('/api/playlist/:playlistId', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/playlist/:playlistId');

  Playlist.findByIdAndRemove(req.params.playlistId)
    .then(() => res.sendStatus(204))
    .catch(next);
});

playlistRouter.put('/api/playlist/:playlistId', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/playlist/:playlistId');

  if(req.body.desc === undefined || req.body.genre === undefined || req.body.title === undefined) return next(createError(400));

  Playlist.findByIdAndUpdate(req.params.playlistId, req.body, { new: true })
    .then( playlist => {
      if (!playlist) return next(createError(404));
      return res.json(playlist);
    })
    .catch( () => next(createError(404)));
});
