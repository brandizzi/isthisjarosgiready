var fs = require('fs');
var crypto = require('crypto');

var errorReport = require('./errorReport.js');

var getSHA256Hash = (path) => {
    console.log('get SHA-256 hash of ' + path);

    return new Promise((resolve, reject) => {
        try {
            var hash = crypto.createHash('sha256');

            var stream = fs.createReadStream(path);
            stream.on('data', (data) => {
                hash.update(data);
            });

            stream.on('end', () => {
                var result = hash.digest('hex');

                console.log('SHA-256 hash of ' + path + ': ' + result);

                resolve(result);
            });

            stream.on('error', (err) => {
                console.warn('failed to hash ' + path);

                var report = errorReport(
                    err, 'failure.cannot_get_hash', 500,
                    'Failed to get hash of ' + path +': ' + err);

                reject(report);
            });
        } catch (err) {
            console.warn('failed to hash ' + path);

            var report = errorReport(
                err, 'failure.cannot_get_hash', 500,
                'Failed to get hash of ' + path +': ' + err);

            reject(report);
        }
    });
};

module.exports = getSHA256Hash;
