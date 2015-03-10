'use strict';
var views = require('co-views');
var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/countrylist');
var co = require('co');

var countries = wrap(db.get('countries'));

// From lifeofjs
co(function * () {
  var countries = yield countries.find({});
});

var render = views(__dirname + '/../views', {
  map: {
    html: 'swig'
  }
});

module.exports.home = function * home(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield render('layout');
};

module.exports.list = function * list(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield render('list', {
    'countries': yield countries.find({})
  });
};

// This must be avoided, use ajax in the view.
module.exports.all = function * all(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield countries.find({});
};

module.exports.fetch = function * fetch(id,next) {
  if ('GET' != this.method) return yield next;
  // Quick hack.
  if(id === ""+parseInt(id, 10)){
    var country = yield countries.find({}, {
      'skip': id - 1,
      'limit': 1
    });
    if (country.length === 0) {
      this.throw(404, 'country with id = ' + id + ' was not found');
    }
    this.body = yield country;
  }

};

module.exports.add = function * add(data,next) {
  if ('POST' != this.method) return yield next;
  var country = yield parse(this, {
    limit: '1kb'
  });
  var inserted = yield countries.insert(country);
  if (!inserted) {
    this.throw(405, "The country couldn't be added.");
  }
  this.body = 'Done!';
};

module.exports.modify = function * modify(id,next) {
  if ('PUT' != this.method) return yield next;

  var data = yield parse(this, {
    limit: '1kb'
  });

  var country = yield countries.find({}, {
    'skip': id - 1,
    'limit': 1
  });

  if (country.length === 0) {
    this.throw(404, 'country with id = ' + id + ' was not found');
  }

  var updated = countries.update(country[0], {
    $set: data
  });

  if (!updated) {
    this.throw(405, "Unable to update.");
  } else {
    this.body = "Done";
  }
};

module.exports.remove = function * remove(id,next) {
  if ('DELETE' != this.method) return yield next;

  var country = yield countries.find({}, {
    'skip': id - 1,
    'limit': 1
  });

  if (country.length === 0) {
    this.throw(404, 'country with id = ' + id + ' was not found');
  }

  var removed = countries.remove(country[0]);

  if (!removed) {
    this.throw(405, "Unable to delete.");
  } else {
    this.body = "Done";
  }

};

module.exports.head = function *(){
  return;
};

module.exports.options = function *() {
  this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS";
};

module.exports.trace = function *() {
  this.body = "Smart! But you can't trace.";
};
