var fs = require('fs');
var crypto = require('crypto');

var errorReport = require('./errorReport.js');

var getSHA256Hash = (path) => {
    return new Promise((resolve, reject) => {
        try {
            var hash = crypto.createHash('sha256');

            var stream = fs.createReadStream(path);
            stream.on('data', (data) => {
                hash.update(data);
            });

            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });

            stream.on('error', (err) => {
                var report = errorReport(
                    err, 'failure.cannot_get_hash', 500,
                    'Failed to get hash of ' + path +': ' + err);

                reject(report);
            });
        } catch (err) {
            var report = errorReport(
                err, 'failure.cannot_get_hash', 500,
                'Failed to get hash of ' + path +': ' + err);

            reject(report);
        }
    });
};

module.exports = getSHA256Hash;
