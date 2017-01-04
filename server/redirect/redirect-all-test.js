'use strict';

var init = require('../base/init');
var error = require('../base/error');
var config = require('../base/config')({ path: 'config/test.json' });
var expb = require('../express/express-base');
var expl = require('../express/express-local');
var redirecta = require('../redirect/redirect-all');
var assert = require('assert');
var assert2 = require('../base/assert2');

before(function (done) {
  init.run(done);
});

// example

// describe('redirecting /user', function () {
//   it('should succeed', function (done) {
//     expl.get('/user/1').redirects(0).end(function (err, res) {
//       assert(err !== null);
//       assert2.redirect(res, '/users/1');
//       done();
//     });
//   });
// });