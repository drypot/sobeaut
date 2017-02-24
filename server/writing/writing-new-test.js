'use strict';

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/sobeaut-test.json' });
var mongo2 = require('../mongo/mongo2')({ dropDatabase: true });
var expb = require('../express/express-base');
var expl = require('../express/express-local');
var userf = require('../user/user-fixture');
var writingb = require('../writing/writing-base');
var writingn = require('../writing/writing-new');
var assert = require('assert');
var assert2 = require('../base/assert2');

before(function (done) {
  init.run(done);
});

before(function (done) {
  userf.login('user1', done);
});

var _now = new Date();

function gen(hours, count, done) {
  var writings = [];
  for (var i = 0; i < count; i++) {
    var writing = {
      _id: writingb.getNewId(),
      uid: userf.user1._id,
      cdate: new Date(_now.getTime() - (hours * 60 * 60 * 1000))
    };
    writings.push(writing);
  }
  writingb.writings.insertMany(writings, done);
}

describe('getTicketCount', function () {
  describe('when no writing', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should return ticketMax', function (done) {
      writingn.getTicketCount(_now, userf.user1, function (err, count, hours) {
        assert2.clear(err);
        assert2.e(count, config.ticketMax);
        done();
      });
    });
  });
  describe('when the last writing aged', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      gen(config.ticketGenInterval + 1, 1, done);
    });
    it('should return ticketMax', function (done) {
      writingn.getTicketCount(_now, userf.user1, function (err, count, hours) {
        assert2.clear(err);
        assert2.e(count, config.ticketMax);
        done();
      });
    });
  });
  describe('when recent writing exists', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      gen(config.ticketGenInterval - 1, 1, done);
    });
    it('should return (ticketMax - 1)', function (done) {
      writingn.getTicketCount(_now, userf.user1, function (err, count, hours) {
        assert2.clear(err);
        assert2.e(count, config.ticketMax - 1);
        done();
      });
    });
  });
  describe('when max writings exist', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      gen(config.ticketGenInterval - 3, config.ticketMax, done);
    });
    it('should return count 0 with left hours', function (done) {
      writingn.getTicketCount(_now, userf.user1, function (err, count, hours) {
        assert2.clear(err);
        assert2.e(count, 0);
        assert2.e(hours, 3);
        done();
      });
    });
  });
});

describe('post /api/writings', function () {
  describe('when no writing exists', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should succeed', function (done) {
      expl.post('/api/writings').field('title', 'title1').field('text', 'text1').end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        assert2.ne(res.body.id, undefined);
        writingb.writings.findOne({ _id: res.body.id }, function (err, writing) {
          assert2.clear(err);
          assert2.e(writing.uid, userf.user1._id);
          assert2.ne(writing.cdate, undefined);
          assert2.e(writing.title, 'title1');
          assert2.e(writing.text, 'text1');
          done();
        });
      });
    });
  });
  describe('when max writings exist', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    before(function (done) {
      gen(config.ticketGenInterval - 3, config.ticketMax, done);
    });
    it('should fail', function (done) {
      expl.post('/api/writings').end(function (err, res) {
        assert2.clear(err);
        assert2.error(res.body.err, 'NO_MORE_TICKET')
        assert2.e(res.body.id, undefined);
        done();
      });
    });
  });
  describe('when title length 128', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should success', function (done) {
      expl.post('/api/writings').field('title', 't'.repeat(128)).end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        done();
      });
    });
  });
  describe('when title length 129 (too long)', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should fail', function (done) {
      expl.post('/api/writings').field('title', 't'.repeat(129)).end(function (err, res) {
        assert2.clear(err);
        assert2.error(res.body.err, 'TITLE_TOO_LONG');
        done();
      });
    });
  });
  describe('when text length 1M', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should success', function (done) {
      expl.post('/api/writings').field('text', 't'.repeat(1024*1024)).end(function (err, res) {
        assert2.clear(err);
        assert2.clear(res.body.err);
        done();
      });
    });
  });
  describe('when text length 1M + 1 (too long)', function () {
    before(function (done) {
      writingb.writings.deleteMany(done);
    });
    it('should fail', function (done) {
      expl.post('/api/writings').field('text', 't'.repeat(1024*1024+1)).end(function (err, res) {
        assert2.clear(err);
        assert2.error(res.body.err, 'TEXT_TOO_LONG');
        done();
      });
    });
  });
});
