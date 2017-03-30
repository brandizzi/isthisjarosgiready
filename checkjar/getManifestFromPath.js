var AdmZip = require('adm-zip');

var errorReport = require('./errorReport.js');

var getManifestFromPath = (path) => {
    return new Promise((resolve, reject) => {
        try {
            var zip = new AdmZip(path);
            var manifest = zip.readAsText('META-INF/MANIFEST.MF');

            resolve(manifest);
        } catch (err) {
            var report = errorReport(
                err, 'failure.cannot_find_manifest_mf', 415,
                'File is NO Zip or contains no MANIFEST.MF');

            reject(report);
        }
    });
};

module.exports = getManifestFromPath;
