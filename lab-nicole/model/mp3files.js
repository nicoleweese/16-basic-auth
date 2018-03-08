'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mp3Schema = Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  playlistID: { type: Schema.Types.ObjectId, required: true },
  songURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('mp3', mp3Schema);