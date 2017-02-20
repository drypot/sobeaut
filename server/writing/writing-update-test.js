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
  describe('updating', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should succeed', function (done) {
      expl.post('/api/writings').field('text', 'writing1').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        assert2.ne(res.body.id, undefined);
        var _id = res.body.id;
        writingb.writings.findOne({ _id: _id }, function (err, writing) {
          assert2.clear(err);
          assert2.ne(writing, undefined);
          assert2.ne(writing.cdate, undefined);
          assert2.e(writing.text, 'writing1');
          expl.put('/api/writings/' + _id).field('text', 'writing2').end(function (err, res) {
            assert2.clear(err);
            assert2.clear(res.body.err);
            writingb.writings.findOne({ _id: _id }, function (err, writing) {
              assert2.clear(err);
              assert2.ne(writing, undefined);
              assert2.ne(writing.cdate, undefined);
              assert2.e(writing.text, 'writing2');
              done();
            });
          });
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
        expl.post('/api/writings').field('text', 'writing1').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          assert2.ne(res.body.id, undefined);
          var _id = res.body.id;
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
