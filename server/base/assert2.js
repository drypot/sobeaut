'use strict';

var fs = require('fs');
var assert = require('assert');
var assert2 = exports;

assert2.e = assert.strictEqual;
assert2.ne = assert.notStrictEqual;
assert2.de = assert.deepStrictEqual;
assert2.nde = assert.notDeepStrictEqual;

assert2.error = undefined; // defined at error.js

assert2.clear = assert.ifError;

assert2.path = function (path, shouldExist)  {
  if (shouldExist === undefined) {
    shouldExist = true;
  }
  let exists = false;
  try {
    fs.accessSync(path);
    exists = true;
  } catch (e) {
  }
  if (shouldExist && !exists) {
    assert.fail(path, shouldExist, path + ' should exist.');
  }
  if (!shouldExist && exists) {
    assert.fail(path, shouldExist, path + ' should not exist.');
  }
};

assert2.redirect = function (res, url) {
  let codes = [301, 302];
  if (codes.indexOf(res.status) === -1) {
    assert.fail(res.status, codes, undefined, 'must be one of');
  }
  if (res.header['location'] !== url) {
    assert.fail(res.header['location'], url, 'must be');
  }
}
