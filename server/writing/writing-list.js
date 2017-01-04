'use strict';

var init = require('../base/init');
var util2 = require('../base/util2');
var error = require('../base/error');
var config = require('../base/config');
var mongo2 = require('../mongo/mongo2');
var expb = require('../express/express-base');
var userb = require('../user/user-base');
var writingb = require('../writing/writing-base');
var bannerb = require('../banner/banner-base');
var writingl = exports;

expb.core.get('/', function (req, res, done) {
  list(req, res, false, done);
});

expb.core.get('/api/writings', function (req, res, done) {
  list(req, res, true, done);
});

function list(req, res, api, done) {
  var lt = parseInt(req.query.lt);
  var gt = parseInt(req.query.gt);
  var ps = parseInt(req.query.ps) || 16;
  mongo2.findPage(writingb.writings, {}, {}, gt, lt, ps, filter, function (err, writings, gt, lt) {
    if (err) return done(err);
    util2.fif(writings.length, function (next) {
      let cdate = writings[writings.length - 1].cdate;
      var now = new Date();
      var ddate = new Date(cdate.getFullYear() - 1, now.getMonth(), now.getDate() + 1);
      mongo2.findDeepDoc(writingb.writings, {}, {}, ddate, next);
    }, function (next) {
      next(null, undefined, undefined);
    }, function (err, dyear, dlt) {
      if (err) return done(err);
      if (api) {
        res.json({
          writings: writings,
          gt: gt,
          lt: lt,
          dyear: dyear,
          dlt: dlt
        });
      } else {
        res.render('writing/writing-list', {
          writings: writings,
          gt: gt ? new util2.UrlMaker('/').add('gt', gt).add('ps', ps, 16).done() : undefined,
          lt: lt ? new util2.UrlMaker('/').add('lt', lt).add('ps', ps, 16).done() : undefined,
          dyear: dyear,
          dlt: dlt ? new util2.UrlMaker('/').add('lt', dlt).add('ps', ps, 16).done() : undefined,
          banners: bannerb.banners
        });
      }
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
