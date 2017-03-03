var fs = require('fs');
var request = require('request');
var tmp = require('tmp');

var errorReport = require('./errorReport.js').errorReport;

var urlparse = require('url').parse;
var basename = require('path').basename;


var contentDispositionRegex = /filename=\"(.*)\"/gi;
var jarFileNameRegex = /\([\w.,\s+-]+\.jar\)/;

var extractJarName = function(response) {
    var contentDisposition = response.headers['content-disposition'];

    console.log(contentDisposition);

    var matching = contentDispositionRegex.exec(contentDisposition);

    if (matching && jarFileNameRegex.test(matching[1])) {
        return matching[1];
    }

    var urlObj = urlparse(response.url);

    var path = decodeURIComponent(response.request.uri.pathname);

    return basename(path);
}



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

        req.on('response', (response) => {
            var filename = extractJarName(response);

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
                cb(undefined, path, filename);
            });
        });

    });
};

exports.downloadToTempFile = downloadToTempFile;
