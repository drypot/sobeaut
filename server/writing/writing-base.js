'use strict';

var exec = require('child_process').exec;

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var mongo2 = require('../mongo/mongo2');
var writingb = exports;

error.define('TITLE_EMPTY', '제목이 없습니다.', 'title');
error.define('TITLE_TOO_LONG', '제목이 너무 깁니다.', 'title');
error.define('TEXT_TOO_LONG', '내용이 너무 깁니다.', 'text');
error.define('WRITING_NOT_EXIST', '글이 없습니다.');
error.define('NO_MORE_TICKET', '새로운 글은 내일 쓰실 수 있습니다.');

// writings

var writingId;

init.add(function (done) {
  if (config.dev) {
    writingb.emptyDir = function (done) {
      done(); // 첨부파일을 다루지 않으므로 테스트 첨부 디렉토리 정리가 필요없다. 
    }
  }
  done();
});

init.add(function (done) {
  writingb.writings = mongo2.db.collection('writings');
  writingb.writings.createIndex({ uid: 1, _id: -1 }, function (err) {
    if (err) return done(err);
    writingb.writings.createIndex({ cdate: 1 }, done);
  });
});

init.add(function (done) {
  mongo2.getLastId(writingb.writings, function (err, id) {
    if (err) return done(err);
    writingId = id;
    console.log('writing-base: writing id = ' + writingId);
    done();
  });
});

writingb.getNewId = function () {
  return ++writingId;
};

writingb.checkUpdatable = function (user, id, done) {
  writingb.writings.findOne({ _id: id }, function (err, writing) {
    if (err) return done(err);
    if (!writing) {
      return done(error('WRITING_NOT_EXIST'));
    }
    if (writing.uid != user._id && !user.admin) {
      return done(error('NOT_AUTHORIZED'));
    }
    done(null, writing);
  });
}