'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');
const path = require('path');

const Mp3 = require('../model/mp3files.js');
const User = require('../model/user.js');
const Playlist = require('../model/playlist.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com',
};

const examplePlaylist = {
  title: 'example title',
  genre: 'example genre',
  desc: 'example description',
};

const exampleMp3 ={
  title: 'Moonlight Sonata',
  artist: 'Beethoven',
  song: path.join(__dirname, '..', 'data', 'SampleAudio_0.4mb.mp3'),
};

describe('mp3 Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Mp3.remove({}),
      User.remove({}),
      Playlist.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });

  describe('POST: /api/playlist/:playlistId/mp3', function() {
    describe('with a valid token and valid date', function() {
      beforeEach( done => {
        new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then( user => user.save())
          .then( user => {
            this.tempUser = user;
            return user.generateToken();
          })
          .then( token => {
            this.tempToken = token;
            done();
          })
          .catch(done);
      });

      beforeEach( done => {
        console.log('this.tempUser', this.tempUser);
        examplePlaylist.userID = this.tempUser._id.toString();
        new Playlist(examplePlaylist).save()
          .then( playlist => {
            this.tempPlaylist = playlist;
            done();
          })
          .catch(done);
      });

      afterEach( done => {
        delete examplePlaylist.userID;
        done();
      });

      it('should return an object containing an mp3 URL', done => {
        console.log(exampleMp3);
        console.log('token', this.tempToken);
        superagent.post(`${url}/api/playlist/${this.tempPlaylist._id}/mp3`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .field('title', exampleMp3.title)
          .field('artist', exampleMp3.artist)
          .attach('song', exampleMp3.song)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            console.log(res.body);
            expect(res.body.title).toEqual(exampleMp3.title);
            expect(res.body.artist).toEqual(exampleMp3.artist);
            expect(res.body.playlistID).toEqual(this.tempPlaylist._id.toString());
            done();
          });
      });
    });
  });
});