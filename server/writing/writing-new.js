'use strict';

var fs = require('fs');

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var expb = require('../express/express-base');
var expu = require('../express/express-upload');
var usera = require('../user/user-auth');
var writingb = require('../writing/writing-base');
var writingn = exports;

expb.core.get('/writings/new', function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var now = new Date();
    getTicketCount(now, user, function (err, count, hours) {
      res.render('writing/writing-new', {
        ticketMax: config.ticketMax,
        ticketCount: count,
        hours: hours
      });
    });
  });
});

expb.core.post('/api/writings', expu.handler(function (req, res, done) {
  usera.checkUser(res, function (err, user) {
    if (err) return done(err);
    var form = getForm(req);
    getTicketCount(form.now, user, function (err, count, hours) {
      if (err) return done(err);
      if (!count) return done(error('NO_MORE_TICKET'));
      checkForm(form, function (err) {
        if (err) return done(err);
        var id = writingb.getNewId();
        var writing = {
          _id: id,
          uid: user._id,
          cdate: form.now,
          align: form.align,
          title: form.title,
          text: form.text
        };
        writingb.writings.insertOne(writing, function (err) {
          if (err) return done(err);
          res.json({ id: id });
          done();
        });
      });
    });
  });
}));

var getForm = writingn.getForm = function (req) {
  var body = req.body;
  var form = {};
  form.now = new Date();
  form.title = String(body.title || '').trim(); 
  form.text = String(body.text || '').trim();
  form.align = !!body.center ? 'center' : 'left';
  return form;
}

var checkForm = writingn.checkForm = function (form, done) {
  var errors = [];
  if (form.title.length > 128) {
    errors.push(error.TITLE_TOO_LONG);
  }
  if (form.text.length > 1024 * 1024) {
    errors.push(error.TEXT_TOO_LONG);
  }
  if (errors.length) {
    done(error(errors));
  } else {
    done();
  }
};

var getTicketCount = writingn.getTicketCount = function(now, user, done) {
  var count = config.ticketMax;
  var hours;
  var opt = {
    fields: { cdate: 1 },
    sort: { uid: 1, _id: -1 },
    limit: config.ticketMax
  }
  writingb.writings.find({ uid: user._id }, opt).toArray(function (err, writings) {
    if (err) return done(err);
    for (var i = 0; i < writings.length; i++) {
      hours = config.ticketGenInterval - Math.floor((now.getTime() - writings[i].cdate.getTime()) / (60 * 60 * 1000));
      if (hours > 0) {
        count--;
      } else {
        break;
      }
    }
    done(null, count, hours);
  });
};
