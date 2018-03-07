'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = Schema ({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  desc: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model('playlist', playlistSchema);