'use strict';

var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser');

var app = express();

app.use(bodyParser());

app.use(require('cors')({
  exposedHeaders: 'Authorization'
}));

app.use(require('./api/users.js'));

//app.use(express.errorHandler());

module.exports = app;
