'use strict';

var http = require('http'),
  app = require('./server.js');

http.createServer(app).listen(3000, function () {
  console.log('API server is running on http://localhost:3000');
});
