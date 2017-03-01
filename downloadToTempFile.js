var fs = require('fs');
var request = require('request');
var tmp = require('tmp');

var errorReport = require('./errorReport.js').errorReport;

var downloadToTempFile = (url, cb) => {
    tmp.file((err, path) => {
        if (err) {
            var report = errorReport(
                err, 'failure.cannot_create_temp_file', 500,
                'Could not creawte a temporary file.');

            cb(report);

            return;
        }


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

        var stream = fs.createWriteStream(path);

        try {
            stream = req.pipe(stream);
        } catch (err) {
            var report = errorReport(
                err, 'failure.cannot_pipe_to_stream', 500,
                'Failed to pipe ' + url + ' to ' + path ,+': ' + err);

            cb(report);

            return;
        }

        stream.on('finish', () => {
            cb(undefined, path);
        });
    });
};

exports.downloadToTempFile = downloadToTempFile;
