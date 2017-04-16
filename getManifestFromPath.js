var AdmZip = require('adm-zip');

var errorReport = require('./errorReport.js');

var getManifestFromPath = (path) => {
    console.log('get manifest from ' + path);

    return new Promise((resolve, reject) => {
        try {
            var zip = new AdmZip(path);
            var manifest = zip.readAsText('META-INF/MANIFEST.MF');

            console.log('manifest retrieved from ' + path);

            resolve(manifest);
        } catch (err) {
            var report = errorReport(
                err, 'failure.cannot_find_manifest_mf', 415,
                'File is NO Zip or contains no MANIFEST.MF');

                console.warn('failed to get manifest from ' + path);

                reject(report);
        }
    });
};

module.exports = getManifestFromPath;