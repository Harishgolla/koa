'use strict';
var countries = require('./controllers/countries');
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var route = require('koa-route');
var koa = require('koa');
var path = require('path');
var app = module.exports = koa();

// Logger
app.use(logger());

app.use(route.get('/', countries.home));
app.use(route.get('/countries/', countries.all));
app.use(route.get('/view/countries/', countries.list));
app.use(route.get('/countries/:id', countries.fetch));
app.use(route.post('/countries/', countries.add));
app.use(route.put('/countries/:id', countries.modify));
app.use(route.delete('/countries/:id', countries.remove));
app.use(route.options('/', countries.options));
app.use(route.trace('/', countries.trace));
app.use(route.head('/', countries.head));



// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(1337);
  console.log('listening on port 1337');
}
