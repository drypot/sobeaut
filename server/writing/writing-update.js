'use strict';

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fs2 = require('../base/fs2');
var util2 = require('../base/util2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var usera = require('../user/user-auth');
var writingb = require('../writing/writing-base');
var writingn = require('../writing/writing-new');
var writingu = exports;

expb.core.get('/writings/:id([0-9]+)/update', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    writingb.checkUpdatable(user, id, function (err, writing) {
      if (err) return done(err);
      res.render('writing/writing-update', {
        writing: writing
      });
    });
  });
});

expb.core.put('/api/writings/:id([0-9]+)', expu.handler(function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    var form = writingn.getForm(req);
    writingb.checkUpdatable(user, id, function (err) {
      if (err) return done(err);
      util2.fif(!form.files, function (next) {
        next({}, null, null);
      }, function (next) {
        var upload = form.files[0];
        writingb.checkImageMeta(upload.path, function (err, meta) {
          if (err) return done(err);
          // 파일, 디렉토리 삭제는 하지 않고 그냥 덮어쓴다.
          // 삭제할 때 파일 없을 경우 에러나는 등 부작용 가능성.
          writingb.saveImage(id, upload.path, meta, function (err, vers) {
            if (err) return done(err);
            next({}, meta, vers);
          });
        });
      }, function (writing, meta, vers) {
        writingb.fillImageDoc(writing, form, meta, vers);
        writingb.writings.updateOne({ _id: id }, { $set: writing }, function (err) {
          if (err) return done(err);
          res.json({});
          done();
        });
      });
    });
  });
}));
