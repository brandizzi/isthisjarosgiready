var express = require('express');
var morgan = require('morgan');
var path = require('path');
var http = require('http');
var fs = require('fs');
var request = require('request');
var tmp = require('tmp');
var AdmZip = require('adm-zip');

var fillTemplate = require('./fillTemplate.js').fillTemplate;

var showIndex = function showIndex(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
};

var errorReport = (err, failureType, statusCode, logMessage) => {
    if (logMessage) {
        console.log(logMessage);
    }

    return {
        errorData: err,
        failureType : failureType,
        statusCode: statusCode
    };
}

var respondError = (req, res, url, report) => {
    res.status(report.statusCode);

    fillTemplate(res, 'public/error.html', (doc) => {
        if (report.failureType == 'failure.cannot_parse_template') {
            return '<p>Template error: ' + JSON.stringify(err);
        }

        var title = doc.getElementsByTagName("title");

        title[0].textContent = "We could not check " + url + " :(";

        var jarFile = doc.getElementsByClassName('jar-file');
        jarFile[0].textContent = url;

        var errorType = doc.getElementsByClassName('error-type');
        errorType[0].textContent = report.failureType;

        var errorData = doc.getElementsByClassName('error-data');
        errorData[0].innerHTML = report.errorData;

        return doc;
    });
};

var respondOK = (req, res, url, contents) => {
    fillTemplate(res, 'public/jar-info.html', (doc) => {
        var soughtKey = "\nBundle-SymbolicName:"
        contents = "\n" + contents;
        var isOSGi = contents.includes(soughtKey);

        var title = doc.getElementsByTagName("title");

        title[0].textContent = "Is " + url + " OSGI-ready?";

        var jarFile = doc.getElementsByClassName('jar-file');

        jarFile[0].textContent = url;

        var jarIsOSGi = doc.getElementsByClassName('jar-is-osgi');

        jarIsOSGi[0].innerHTML = ""+isOSGi;

        return doc;
    });
};

var checkJar = function (req, res) {
    var url = req.query.url;

    getManifestFileFromJarURL(url, function(report, contents) {
        if (report) {
            respondError(req, res, url, report);
            return;
        }

        respondOK(req, res, url, contents);

    });
};

var downloadJarToFile = (url, path, cb) => {
    var stream = fs.createWriteStream(path);

    var req;
    try {
        req = request(url);
    } catch (err) {
        var report = errorReport(
            err, 'failure.cannot_get_file', 404,
            'Failed to get file from ' + url + ': ' + err);

        cb(report);

        return;
    }

    var stream;
    try {
        stream  = req.pipe(stream);
    } catch (err) {
        var report = errorReport(
            err, 'failure.cannot_pipe_to_stream', 500,
            'Failed to pipe ' + url + ' to ' + path ,+': ' + err);

        cb(report);

        return;
    }

    stream.on('finish', () => {
        try {
            var zip = new AdmZip(path);
            var manifest = zip.readAsText('META-INF/MANIFEST.MF');
        } catch (err) {
            var report = errorReport(
                err, 'failure.cannot_find_manifest_mf', 415,
                'File at ' + url + 'is NO Zip or contains no MANIFEST.MF');

            cb(report);

            return;
        }

        cb(undefined, manifest);
    });
};

var getManifestFileFromJarURL = (url, cb) => {
    tmp.file((err, path) => {
        if (err) {
            var report = errorReport(
                err, 'failure.cannot_create_temp_file', 500,
                'Could not creawte a temporary file.');

            cb(report);

            return;
        }

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

