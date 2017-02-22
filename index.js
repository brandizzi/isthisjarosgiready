var express = require('express');
var morgan = require('morgan');
var path = require('path');
var http = require('http');
var fs = require('fs');
var request = require('request');
var tmp = require('tmp');

var showIndex = function showIndex(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
};

var checkJar = function (req, res) {
        var url = req.query.url;
        console.error('checking' + url);
        downloadZipFileFromURL(url, function(err, contents) {
        	console.log('here we are');
        	console.log(err, contents);
        	if (err) throw err;
        	res.write(contents.toString());
        	res.end();
        });
};

var downloadToFile = function(url, path, cb) {
	var stream = fs.createWriteStream(path);
	console.log('downloading to file ' + path);

	request(url).pipe(stream).on('close', function() {
		fs.readFile(path, 'utf8', cb);
	});
};

var downloadZipFileFromURL = function (url, cb) {
        console.log('downloading zip '+ url);
	tmp.file(function(err, path) {
		console.log('create temp file ' + path);
		if (err) throw err;
		downloadToFile(url, path, cb);
	});
};



var app = express();

app.use(morgan('combined'));

app.get('/', showIndex);

app.get('/isit', checkJar);

app.listen(80, function () {
  console.log('Listening on port 80');
});

