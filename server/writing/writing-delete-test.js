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
var writingn = require('../writing/writing-new');
var writingd = require('../writing/writing-delete');
var assert = require('assert');
var assert2 = require('../base/assert2');

before(function (done) {
  init.run(done);
});

describe('del /api/writings/[id]', function () {
  describe('deleting mine', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      userf.login('user1', done);
    });
    it('should succeed', function (done) {
      expl.post('/api/writings').field('text', 'text1').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        assert2.ne(res.body.id, undefined);
        var _id1 = res.body.id;
        expl.post('/api/writings').field('text', 'text2').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          assert2.ne(res.body.id, undefined);
          var _id2 = res.body.id;
          expl.del('/api/writings/' + _id1, function (err, res) {
            assert2.clear(err);
            assert2.clear(res.body.err);
            writingb.writings.findOne({ _id: _id1 }, function (err, writing) {
              assert2.clear(err);
              assert2.e(writing, null);
              writingb.writings.findOne({ _id: _id2 }, function (err, writing) {
                assert2.clear(err);
                assert2.ne(writing, undefined);
                done();
              });
            });
          });
        });
      });
    });
  });
  describe('deleting by admin', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should succeed', function (done) {
      userf.login('user1', function (err) {
        assert2.clear(err);
        expl.post('/api/writings').field('text', 'text1').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          assert2.ne(res.body.id, undefined);
          var _id = res.body.id;
          userf.login('admin', function (err) {
            assert2.clear(err);
            expl.del('/api/writings/' + _id, function (err, res) {
              assert2.clear(err);
              assert2.clear(res.body.err);
              writingb.writings.findOne({ _id: _id }, function (err, writing) {
                assert2.clear(err);
                assert2.e(writing, null);
                done();
              });
            });
          });
        });
      });
    });
  });
  describe('deleting other\'s', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should fail', function (done) {
      userf.login('user1', function (err) {
        assert2.clear(err);
        expl.post('/api/writings').field('text', 'text1').end(function (err, res) {
          assert2.clear(err);
          assert2.clear(res.body.err);
          assert2.ne(res.body.id, undefined);
          var _id = res.body.id;
          userf.login('user2', function (err) {
            assert2.clear(err);
            expl.del('/api/writings/' + _id, function (err, res) {
              assert2.clear(err);
              assert2.ne(res.body.err, undefined);
              assert2.error(res.body.err, 'NOT_AUTHORIZED');
              writingb.writings.findOne({ _id: _id }, function (err, writing) {
                assert2.clear(err);
                assert2.ne(writing, undefined);
                done();
              });
            });
          });
        });
      });
    });
  });
});
