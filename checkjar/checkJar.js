var models = require('./models.js');
var downloadToTempFile = require('./downloadToTempFile.js');
var getManifestFromPath = require('./getManifestFromPath');
var getSHA256Hash = require('./getSHA256Hash');
var wdd = require('./weDeployData');

var getPOMObj = (groupId, artifactId, version) => {
    if (groupId && artifactId && version) {
        return new models.POM(groupId, artifactId, version);
    }
};

var sorted = (array) => {
    var copy = array.slice();
    copy.sort();
    return copy;
}

var sortedJarInfo = (jarInfo) => {
    var copy = {};
    Object.assign(copy, jarInfo);

    copy.pom = sorted(copy.pom);
    copy.filenames = sorted(copy.filenames);
    copy.urls = sorted(copy.urls);

    return copy;
};

var equalJarInfo = (ji1, ji2) => {
    return deepEqual(sortedJarInfo(ji1), sortedJarInfo(ji2));
};

var checkJar = (url, groupId, artifactId, version) => {
    return new Promise((resolve, reject) => {
        var pom = getPOMObj(groupId, artifactId, version);
        var jarInfo = new models.JarInfo();
        var toCreate, toUpdate;

        jarInfo.addURL(url);
        jarInfo.addPOM(pom);

        console.log('checking ' + url);

        downloadToTempFile(url)
        .then(fileInfo => {
            jarInfo.addFilename(fileInfo.filename);

            return getSHA256Hash(fileInfo.path)
            .then(hash => {
                console.log('trying to get info ' + hash + ' from db');
                jarInfo.id = hash;

                return wdd.get(hash)
                .then(ji => {
                    console.log('got jar info from wdd');
                    jarInfo.merge(ji);

                    if (!jarInfo.equals(ji)) {
                        toUpdate = jarInfo;
                    }
                })
                .catch(err => {
                    console.log('no info' + hash + ' from wdd');
                    return getManifestFromPath(fileInfo.path)
                    .then(contents => {
                        var soughtKey = "\nBundle-SymbolicName:"
                        contents = "\n" + contents;
                        jarInfo.osgiready = contents.includes(soughtKey);

                        toCreate = jarInfo;
                    });
                })
            });
        })
        .then(() => {
            console.log('checked: ' + url);
            console.log('info: ' + JSON.stringify(jarInfo));
            resolve(jarInfo);

            if (toUpdate) {
                return wdd.update(jarInfo);
            } else if (toCreate) {
                return wdd.create(toCreate);
            }
        })
        .catch(report => {
            console.warn('failed checking ' + url);

            reject(report);
        }).then(() => {
            console.warn('Frankly I don\'t know if we need other then here tbh');
        });
    });
};

module.exports = checkJar;
