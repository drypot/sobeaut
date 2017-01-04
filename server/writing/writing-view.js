'use strict';

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var util2 = require('../base/util2');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var userb = require('../user/user-base');
var writingb = require('../writing/writing-base');

expb.core.get('/api/writings/:id([0-9]+)', function (req, res, done) {
  view(req, res, true, done);
});

expb.core.get('/writings/:id([0-9]+)', function (req, res, done) {
  view(req, res, false, done);
});

function view(req, res, api, done) {
  var id = parseInt(req.params.id) || 0;
  writingb.writings.findOne({ _id: id }, function (err, writing) {
    if (err) return done(err);
    if (!writing) return done(error('WRITING_NOT_EXIST'));
    userb.getCached(writing.uid, function (err, user) {
      if (err) return done(err);
      writing.user = {
        _id: user._id,
        name: user.name,
        home: user.home
      };
      writing.dir = writingb.getDirUrl(writing._id);
      writing.thumb = writingb.getThumbUrl(writing._id);
      writing.cdateStr = util2.dateTimeString(writing.cdate);
      writing.cdate = writing.cdate.getTime();
      if (api) {
        res.json(writing);
      } else {
        var cuser = res.locals.user;
        res.render('writing/writing-view', {
          writing: writing,
          updatable: cuser && (writing.user._id == cuser._id || cuser.admin),
        });
      }
    });
  });
}
