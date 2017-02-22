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
      writingn.checkForm(form, function (err) {
        if (err) return done(err);
        var writing = {
          title: form.title,
          text: form.text
        };
        writingb.writings.updateOne({ _id: id }, { $set: writing }, function (err) {
          if (err) return done(err);
          res.json({});
          done();
        });
      });
    });
  });
}));
