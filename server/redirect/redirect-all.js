'use strict';

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config');
var expb = require('../express/express-base');

// example
//
// expb.core.get('/user/:id([0-9]+)', function (req, res, done) {
//   res.redirect(301, '/users/' + req.params.id);
// });
