'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('mp3uploader:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const createError = require('http-errors');
const User = require('../model/user.js');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');
  
  if (req.body.username === undefined || req.body.email === undefined) return res.sendStatus(400);
  
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch( err => {
      next(createError(404, err.message));
    });
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');

  User.findOne({ username: req.auth.username })
    .then( user => {
      if (!user) return next(createError(401));      
      return user.comparePasswordHash(req.auth.password);
    })
    .then( user => user.generateToken())
    .then( token => res.send(token))
    .catch( err => {
      if (err.name === 'ValidationError') return next(createError(401));
      return next(err);
    });
});