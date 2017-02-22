var express = require('express');
var morgan = require('morgan');
var path = require('path');
var http = require('http');
var fs = require('fs');
var request = require('request');
var tmp = require('tmp');
var AdmZip = require('adm-zip');

var showIndex = function showIndex(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
};

var checkJar = function (req, res) {
        var url = req.query.url;
        console.error('checking' + url);
        getManifestFileFromJarURL(url, function(err, contents) {
        	console.log('here we are');
        	console.log(err, contents);
        	if (err) throw err;
        	res.write(contents.toString());
        	res.end();
        });
};

var downloadJarToFile = function(url, path, cb) {
	var stream = fs.createWriteStream(path);
	console.log('downloading to file ' + path);

	var req;
	try {
		req = request(url).pipe(stream);
	} catch (err) {
		cb(err);
		return;
	}

	req.on('close', function(err) {
		if (err) {
			cb(err);
			return;
		}

		var zip = new AdmZip(path);

		try {
			var manifest = zip.readAsText('META-INF/MANIFEST.MF');
		} catch (err) {
			cb(err);
			return;
		}

		cb(err, manifest);
	});
};

var getManifestFileFromJarURL = function (url, cb) {
        console.log('downloading zip '+ url);
	tmp.file(function(err, path) {
		console.log('create temp file ' + path);
		if (err) throw err;
		downloadJarToFile(url, path, cb);
	});
};



var app = express();

app.use(morgan('combined'));

app.get('/', showIndex);

app.get('/isit', checkJar);

app.listen(80, function () {
  console.log('Listening on port 80');
});

