var downloadToTempFile = require('./downloadToTempFile.js');
var getManifestFromPath = require('./getManifestFromPath');
var getSHA256Hash = require('./getSHA256Hash');
var wdd = require('./weDeployData');

var checkJar = (url, groupId, artifactId, version) => {
    return new Promise((resolve, reject) => {
        var jarInfo = {
            urls: [url]
        };

        downloadToTempFile(url)
        .then((fileInfo) => {
            jarInfo.temporaryPath = fileInfo.path;
            jarInfo.filenames = [fileInfo.filename];

            return getSHA256Hash(fileInfo.path)
            .then((hash) => {
                jarInfo.id = hash;

                return wdd.get(hash)
                .then((ji) => {
                    Object.assign(jarInfo, ji);
                })
                .catch((err) => {
                    return getManifestFromPath(fileInfo.path)
                    .then((contents) => {
                        var soughtKey = "\nBundle-SymbolicName:"
                        contents = "\n" + contents;
                        jarInfo.osgiready = contents.includes(soughtKey);

                        wdd.create(jarInfo);
                    });
                })
            });
        })
        .then(() => {
            resolve(jarInfo);
        })
        .catch((report) => {
            reject(report);
        });
    });
};

module.exports = checkJar;
