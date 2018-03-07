'use strict';

const request = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

const User = require('../model/user.js');
const Music = require('../model/music.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com',
};

const exampleMusic = {
  title: 'Symphony No. 9',
  artist: 'Beethoven',
  genre: 'Classical',
  album: 'NA',
};

describe('Music Routes', function () {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });

  afterAll(done => {
    serverToggle.serverOff(server, done);
  });

  afterEach(done => {
    Promise.all([
      User.remove({}),
      Music.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });

  describe('POST: /api/music', () => {
    beforeEach(done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    it('should return a music library', done => {
      request.post(`${url}/api/music`)
        .send(exampleMusic)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(exampleMusic.title);
          expect(res.body.artist).toEqual(exampleMusic.artist);
          expect(res.body.genre).toEqual(exampleMusic.genre);
          expect(res.body.album).toEqual(exampleMusic.album);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 400 if no req.body was provided', done => {
      request.post(`${url}/api/music`)
        .send({title: 'hi'})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should respond with a 401 if no token was provided', done => {
      request.post(`${url}/api/music`)
        .send(exampleMusic)
        .set({
          Authorization: ``,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
  });

  describe('GET: /api/music/:musicId', () => {
    beforeEach(done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach(done => {
      exampleMusic.userID = this.tempUser._id.toString();
      new Music(exampleMusic).save()
        .then(music => {
          this.tempMusic = music;
          done();
        })
        .catch(done);
    });

    afterEach(() => {
      delete exampleMusic.userID;
    });

    it('should return a song', done => {
      request.get(`${url}/api/music/${this.tempMusic._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(exampleMusic.name);
          expect(res.body.desc).toEqual(exampleMusic.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should respond with a 401 if no token was provided', done => {
      request.get(`${url}/api/music/${this.tempMusic._id}`)
        .set({
          Authorization: ``,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should respond with a 404 if the ID is not found', done => {
      request.get(`${url}/api/music/5a9f61616e240f58d9ba47b1`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });
});