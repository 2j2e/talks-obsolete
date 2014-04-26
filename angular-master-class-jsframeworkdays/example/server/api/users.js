'use strict';

var express = require('express');

var app = express();
module.exports = app;

app.use(require('connect-nocache')());

var userRoles = {
  'public': 1, // 001
  user: 2, // 010
  admin: 4  // 100
};

var users = {
  'joe.black': {
    password: 'death',
    role: userRoles.user
  },
  'admin': {
    password: 'super',
    role: userRoles.admin
  }
};

app.post('/api/auth', function (req, res) {
  var login = req.body.login,
    password = req.body.password;

  if (users[login] && users[login].password == password) {
    res.setHeader("Authorization", "ZG9jdG9yOm51bGw=");
    res.json(200, {role: users[login].role});
  }
  else
    res.send(401);
});

app.get('/api/user/:id/feed', function (req, res) {
  res.json(200, [
    {id: 1, text: 'Inspired Iron Man Digital Art Mashup Series by Bosslogic'},
    {id: 2, text: 'Gulp Fiction has been blowing up in our hosting traffic charts.'},
    {id: 3, text: 'A quick and easy way to setup a RESTful JSON API in Go...'},
    {id: 4, text: 'Gobot – Go framework for robotics, physical computing, internet of things..'}
  ]);
})
