'use strict';

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var fs2 = require('../base/fs2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var usera = require('../user/user-auth');
var writingb = require('../writing/writing-base');

expb.core.delete('/api/writings/:id([0-9]+)', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var id = parseInt(req.params.id) || 0;
    writingb.checkUpdatable(user, id, function (err) {
      if (err) return done(err);
      writingb.writings.deleteOne({ _id: id }, function (err, cnt) {
        if (err) return done(err);
        res.json({});
      });
    });
  });
});
