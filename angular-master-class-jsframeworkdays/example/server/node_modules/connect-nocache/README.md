Usage:
------

```js
var noCache = require('connect-nocache')();
var express = require('express')

var app = express()
app.get('/events', noCache, function (req, res) {
  // res has no cache headers set.
});
```
