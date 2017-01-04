'use strict';

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var fs2 = require('../base/fs2');
var config = require('../base/config')({ path: 'config/sobeaut-test.json' });
var mongo2 = require('../mongo/mongo2')({ dropDatabase: true });
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var writingb = require('../writing/writing-base');
var writingu = require('../writing/writing-update');
var assert = require('assert');
var assert2 = require('../base/assert2');

before(function (done) {
  init.run(done);
});

before(function (done) {
  writingb.emptyDir(done);
});

describe('put /api/writings/id', function () {
  describe('updating with writing', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should succeed', function (done) {
      expl.post('/api/writings').field('text', 'writing1').attach('files', 'samples/2560x1440.jpg').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        var _id = res.body.ids[0];
        writingb.writings.findOne({ _id: _id }, function (err, writing) {
          assert2.clear(err);
          assert2.ne(writing, undefined);
          assert2.ne(writing.cdate, undefined);
          assert2.e(writing.comment, 'writing1');
          writingb.identify(writingb.getPath(_id), function (err, meta) {
            assert2.clear(err);
            assert2.e(meta.width, writingb.maxWidth);
            assert(meta.height <writingb.maxWidth);
            expl.put('/api/writings/' + _id).field('text', 'writing2').attach('files', 'samples/1440x2560.jpg').end(function (err, res) {
              assert2.clear(err);
              assert2.clear(res.body.err);
              writingb.writings.findOne({ _id: _id }, function (err, writing) {
                assert2.clear(err);
                assert2.ne(writing, undefined);
                assert2.ne(writing.cdate, undefined);
                assert2.e(writing.comment, 'writing2');
                writingb.identify(writingb.getPath(_id), function (err, meta) {
                  assert2.clear(err);
                  assert(meta.width < writingb.maxWidth);
                  assert2.e(meta.height, writingb.maxWidth);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  describe('updating with small writing', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should fail', function (done) {
      expl.post('/api/writings').field('text', 'writing1').attach('files', 'samples/640x360.jpg').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        var _id = res.body.ids[0];
        expl.put('/api/writings/' + _id).attach('files', 'samples/360x240.jpg').end(function (err, res) {
          assert2.clear(err);
          assert2.ne(res.body.err, undefined);
          assert2.error(res.body.err, 'WRITING_SIZE');
          done();
        });
      });
    });
  });
  describe('updating with no file', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should succeed', function (done) {
      expl.post('/api/writings').field('text', 'writing1').attach('files', 'samples/640x360.jpg').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        var _id = res.body.ids[0];
        expl.put('/api/writings/' + _id).field('text', 'updated with no file').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          writingb.writings.findOne({ _id: _id }, function (err, writing) {
            assert2.clear(err);
            assert2.ne(writing, undefined);
            assert2.e(writing.comment, 'updated with no file');
            done();
          });
        });
      });
    });
  });
  describe('updating with text file', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should fail', function (done) {
      expl.post('/api/writings').field('text', 'writing1').attach('files', 'samples/640x360.jpg').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        var _id = res.body.ids[0];
        expl.put('/api/writings/' + _id).attach('files', 'server/express/express-upload-f1.txt').end(function (err, res) {
          assert2.clear(err);
          assert2.ne(res.body.err, undefined);
          assert2.error(res.body.err, 'WRITING_TYPE');
          done();
        });
      });
    });
  });
  describe('updating other\'s', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should fail', function (done) {
      userf.login('user1', function (err) {
        if (err) return done(err);
        expl.post('/api/writings').field('text', 'writing1').attach('files', 'samples/640x360.jpg').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          var _id = res.body.ids[0];
          userf.login('user2', function (err) {
            if (err) return done(err);
            expl.put('/api/writings/' + _id).field('text', 'xxx').end(function (err, res) {
              assert2.clear(err);
              assert2.ne(res.body.err, undefined);
              assert2.error(res.body.err, 'NOT_AUTHORIZED');
              done();
            });
          });
        });
      });
    });
  });
});
