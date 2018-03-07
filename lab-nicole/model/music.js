'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const musicSchema = Schema ({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String, required: true },
  album: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('music', musicSchema);