var AdmZip = require('adm-zip');

var errorReport = require('./errorReport.js').errorReport;

var getManifestFromPath = (path, cb) => {
    var manifest;
    try {
        var zip = new AdmZip(path);
        manifest = zip.readAsText('META-INF/MANIFEST.MF');
    } catch (err) {
        var report = errorReport(
            err, 'failure.cannot_find_manifest_mf', 415,
            'File is NO Zip or contains no MANIFEST.MF');

        cb(report);

        return;
    }

    cb(undefined, manifest);
};

exports.getManifestFromPath = getManifestFromPath;
