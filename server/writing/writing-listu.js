'use strict';

var init = require('../base/init');
var error = require('../base/error');
var util2 = require('../base/util2');
var mongo2 = require('../mongo/mongo2');
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var writingb = require('../writing/writing-base');

expb.core.get('/users/:id([0-9]+)', function (req, res, done) {
  var id = parseInt(req.params.id) || 0;
  userb.getCached(id, function (err, tuser) {
    if (err) return done(err);
    profile(req, res, tuser);
  });
});

expb.core.get('/:name([^/]+)', function (req, res, done) {
  var homel = decodeURIComponent(req.params.name).toLowerCase();
  userb.getCachedByHome(homel, function (err, tuser) {
    if (err) return done(err);
    if (!tuser) return done();
    profile(req, res, tuser);
  });
});

function profile(req, res, tuser) {
  var user = res.locals.user;
  var lt = parseInt(req.query.lt);
  var gt = parseInt(req.query.gt);
  var ps = parseInt(req.query.ps) || 16;
  var query = { uid: tuser.id };
  var opt = { text: 0 }
  mongo2.findPage(writingb.writings, { uid: tuser._id }, opt, gt, lt, ps, filter, function (err, writings, gt, lt) {
    if (err) return done(err);
    util2.fif(writings.length, function (next) {
      let cdate = writings[writings.length - 1].cdate;
      var now = new Date();
      var ddate = new Date(cdate.getFullYear() - 1, now.getMonth(), now.getDate() + 1);
      mongo2.findDeepDoc(writingb.writings, { uid: tuser._id }, opt, ddate, next);
    }, function (next) {
      next(null, undefined, undefined);
    }, function (err, dyear, dlt) {
      res.render('writing/writing-listu', {
        tuser: tuser,
        updatable: user && (user._id === tuser._id || user.admin),
        writings: writings,
        gt: gt ? new util2.UrlMaker(req.path).add('gt', gt).add('ps', ps, 16).done() : undefined,
        lt: lt ? new util2.UrlMaker(req.path).add('lt', lt).add('ps', ps, 16).done() : undefined,
        dyear: dyear,
        dlt: dlt ? new util2.UrlMaker(req.path).add('lt', dlt).add('ps', ps, 16).done() : undefined,
        path: req.path
      });
    });
  });
}

function filter(writing, done) {
  userb.getCached(writing.uid, function (err, user) {
    if (err) return done(err);
    writing.user = {
      _id: user._id,
      name: user.name,
      home: user.home
    };
    writing.cdateStr = util2.dateTimeString(writing.cdate);
    done(null, writing);
  });
}
