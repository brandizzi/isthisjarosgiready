var express = require('express');
var morgan = require('morgan');
var path = require('path');
var http = require('http');
var fs = require('fs');
var app = express();

app.use(morgan('combined'));

app.get('/', function (req, res) {
        console.log('gogo');
        res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/isit', function (req, res) {
        var url = req.query.url;
        res.write('lets process ' + url);
        res.end();
});

app.listen(80, function () {
  console.log('Listening on port 80');
  console.log('what now?');
  console.log(new Date());
});

