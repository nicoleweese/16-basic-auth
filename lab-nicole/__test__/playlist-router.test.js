'use strict';

const request = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

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
  title: 'Relaxing',
  genre: 'House',
  desc: 'for relaxing on the beach',
};

const updatedPlaylist = {
  title: 'Relaxing',
  genre: 'Tropical House',
  desc: 'for relaxing',
};

describe('Playlist Routes', function () {
  beforeAll(done => {
    serverToggle.serverOn(server, done);
  });

  afterAll(done => {
    serverToggle.serverOff(server, done);
  });

  afterEach(done => {
    Promise.all([
      User.remove({}),
      Playlist.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });

  describe('POST: /api/playlist', () => {
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

    it('should return a playlist library', done => {
      request.post(`${url}/api/playlist`)
        .send(examplePlaylist)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(examplePlaylist.title);
          expect(res.body.genre).toEqual(examplePlaylist.genre);
          expect(res.body.desc).toEqual(examplePlaylist.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should return a 400 if no req.body was provided', done => {
      request.post(`${url}/api/playlist`)
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
      request.post(`${url}/api/playlist`)
        .send(examplePlaylist)
        .set({
          Authorization: ``,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });
  });

  describe('GET: /api/playlist/:playlistId', () => {
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
      examplePlaylist.userID = this.tempUser._id.toString();
      new Playlist(examplePlaylist).save()
        .then(playlist => {
          this.tempPlaylist = playlist;
          done();
        })
        .catch(done);
    });

    afterEach(() => {
      delete examplePlaylist.userID;
    });

    it('should return a playlist', done => {
      request.get(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.name).toEqual(examplePlaylist.name);
          expect(res.body.desc).toEqual(examplePlaylist.desc);
          expect(res.body.userID).toEqual(this.tempUser._id.toString());
          done();
        });
    });

    it('should respond with a 401 if no token was provided', done => {
      request.get(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .set({
          Authorization: ``,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should respond with a 404 if the ID is not found', done => {
      request.get(`${url}/api/playlist/5a9f61616e240f58d9ba47b1`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('PUT /api/playlist/:playlistId', () => {
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
      examplePlaylist.userID = this.tempUser._id.toString();
      new Playlist(examplePlaylist).save()
        .then(playlist => {
          this.tempPlaylist = playlist;
          done();
        })
        .catch(done);
    });

    afterEach(() => {
      delete examplePlaylist.userID;
    });

    it('should respond with a status of 200 for proper requests', done => {
      request.put(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .send(updatedPlaylist)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(updatedPlaylist.title);
          expect(res.body.genre).toEqual(updatedPlaylist.genre);
          expect(res.body.desc).toEqual(updatedPlaylist.desc);
          done();
        });
    });

    it('should respond with a status of 401 if no token is provided', done => {
      request.put(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .send(updatedPlaylist)
        .set({
          Authorization: `Bearer `,
        })
        .end((err, res) => {
          expect(res.status).toEqual(401);
          done();
        });
    });

    it('should respond with a 400 if the body was invalid', done => {
      request.put(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .send({name: 'hi'})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should respond with a 404 if the id was not found', done => {
      request.put(`${url}/api/playlist/213456`)
        .send(updatedPlaylist)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('DELETE /api/playlist/:playlistId', () => {
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
      examplePlaylist.userID = this.tempUser._id.toString();
      new Playlist(examplePlaylist).save()
        .then(playlist => {
          this.tempPlaylist = playlist;
          done();
        })
        .catch(done);
    });

    afterEach(() => {
      delete examplePlaylist.userID;
    });

    it('should return a 204 once the playlist is deleted', done => {
      request.delete(`${url}/api/playlist/${this.tempPlaylist._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).toEqual(204);
          done();
        });
    });
  });
});