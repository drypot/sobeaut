'use strict';

var mongo = require('mongodb');

var init = require('../base/init');
var config = require('../base/config');
var util2 = require('../base/util2');
var assert = require('assert');
var assert2 = require('../base/assert2');

var opt = {};

var mongo2 = exports = module.exports = function (_opt) {
  for(var p in _opt) {
    opt[p] = _opt[p];
  }
  return mongo2;
};

mongo2.ObjectID = mongo.ObjectID;

// db

init.add(function (done) {
  assert2.ne(config.mongodb, undefined);
  mongo.MongoClient.connect('mongodb://localhost:27017/' + config.mongodb, function(err, db) {
    if (err) return done(err);
    mongo2.db = db;
    console.log('mongo: ' + mongo2.db.databaseName);
    if (config.mongoUser) {
      mongo2.db.authenticate(config.mongoUser, config.mongoPassword, done);
    } else {
      done();
    }    
  });
});

init.add(function (done) {
  if (opt.dropDatabase) {
    console.log('mongo: dropping db');
    mongo2.db.dropDatabase(done);
  } else {
    done();
  }
});

// values

mongo2.values = {};

init.add(function (done) {
  mongo2._values = mongo2.db.collection('values');
  done();
});

mongo2.values.find = function (id, done) {
  mongo2._values.findOne({ _id: id }, function (err, doc) {
    if (err) return done(err);
    done(null, doc ? doc.v : null);
  });
};

mongo2.values.update = function (id, value, done) {
  mongo2._values.updateOne({ _id: id }, { $set: { v: value } }, { upsert: true }, done);
};

// utilities

// _id 를 숫자로 쓰는 컬렉션만 페이징할 수 있다.

mongo2.findPage = function (col, query, opt, gt, lt, ps, filter, done) {
  let gtPage = !isNaN(gt);
  let ltPage = !gtPage && !isNaN(lt);
  if (gtPage) {
    query._id = { $gt: gt };
    opt.sort = { _id: 1 };
  } else {
    opt.sort = { _id: -1 };
    if (ltPage) {
      query._id = { $lt: lt };
    }
  }
  opt.limit = ps + 1;
  let cursor = col.find(query, opt);
  let results = [];
  let count = 0, first, last;
  (function read() {
    cursor.nextObject(function (err, doc) {
      if (err) return done(err);
      let full = count == ps;
      if (!doc || full) {
        let more = full && !!doc;
        let rgt, rlt;
        if (gtPage) {
          rgt = more ? last : undefined;
          rlt = gt !== 0 ? first : undefined;
        } else if (ltPage) {
          rgt = first;
          rlt = more ? last : undefined;
        } else {
          rgt = undefined;
          rlt = more ? last : undefined;
        }
        done(null, results, rgt, rlt);
      } else {
        count++;
        if (!first) first = doc._id;
        last = doc._id;
        util2.fif(filter, function (next) {
          filter(doc, function (err, doc) {
            if (err) return done(err);
            next(doc);
          });
        }, function (next) {
          next(doc);
        }, function (doc) {
          if (doc) {
            if (gtPage) {
              results.unshift(doc);
            } else {
              results.push(doc);
            }
          }
          setImmediate(read);
        });
      }
    });
  })();
};

mongo2.findDeepDoc = function (col, query, opt, date, done) {
  query.cdate = { $lt : date };
  opt.sort = { cdate: -1 }; 
  opt.limit = 1;
  col.findOne(query, opt, function (err, ddoc) {
    if (err) return done(err);
    if (ddoc) {
      done(null, ddoc.cdate.getFullYear(), ddoc._id + 1);
    } else {
      done(null);
    }
  });
}

mongo2.forEach = function (col, doit, done) {
  var cursor = col.find();
  (function read() {
    cursor.nextObject(function (err, obj) {
      if (err) return done(err);
      if (obj) {
        doit(obj, function (err) {
          if (err) return done(err);
          setImmediate(read);         
        });
        return;
      }
      done();
    });
  })();
};

mongo2.getLastId = function (col, done) {
  var opt = { fields: { _id: 1 }, sort: { _id: -1 }, limit: 1 };
  col.find({}, opt).nextObject(function (err, obj) {
    done(err, obj ? obj._id : 0);
  });
};
