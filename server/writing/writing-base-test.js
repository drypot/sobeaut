'use strict';

var init = require('../base/init');
var config = require('../base/config')({ path: 'config/sobeaut-test.json' });
var writingb = require('../writing/writing-base');
var assert = require('assert');
var assert2 = require('../base/assert2');

before(function (done) {
  init.run(done);
});

describe('writingb.writings', function () {
  it('should exist', function () {
    assert2.ne(writingb.writings, undefined);
  });
});

describe('getNewId()', function () {
  it('should work', function () {
    assert2.e(writingb.getNewId() < writingb.getNewId(), true);
  });
});
