var fs = require('fs');
var crypto = require('crypto');

var getSHA256Hash = function(path, cb) {
    var hash = crypto.createHash('sha256');

    var stream = fs.createReadStream(path);
    stream.on('data', (data) => {
        hash.update(data);
    });

    stream.on('end', () => {
        cb(null, hash.digest('hex'));
    });
};

exports.getSHA256Hash = getSHA256Hash;
