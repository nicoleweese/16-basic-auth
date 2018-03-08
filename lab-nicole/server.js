'use strict';

const express = require('express');
const debug = require('debug')('mp3uploader:server');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter = require('./route/auth-router.js');
const playlistRouter = require('./route/playlist-router.js');
const mp3Router = require('./route/mp3-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(playlistRouter);
app.use(mp3Router);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

server.isRunning = true;