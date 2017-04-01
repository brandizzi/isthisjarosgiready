var deepEqual = require('deep-equal');

var downloadToTempFile = require('./downloadToTempFile.js');
var getManifestFromPath = require('./getManifestFromPath');
var getSHA256Hash = require('./getSHA256Hash');
var wdd = require('./weDeployData');

var getPOMObj = (groupId, artifactId, version) => {
    if (groupId && artifactId && version) {
        return {groupId, artifactId, version};
    }
};

var getPOMList = (pom) => {
    var list = [];

    if (pom) {
        list.push(pom);
    }

    return list;
};

var hasPOM = (list, pom) => {
    if (!pom) {
        return false;
    }

    return list.some(
        (item) => item.groupId === pom.groupId &&
                item.artifactId === pom.artifactId &&
                item.version === pom.version
    );
}

var mergeJarInfo = (jarInfo, ji) => {
    var filenamesSet = new Set(jarInfo.filenames, ji.filenames);
    var urlsSet = new Set(jarInfo.urls, ji.urls);

    var pomsTable = {};

    ([].concat(jarInfo.pom, ji.pom)).forEach(
        (item) => {
            var key = item.groupId+'|'+item.artifactId+'|'+item.version;
            pomsTable[key] = item;
        }
    );

    var merged = {};
    Object.assign(merged, jarInfo, ji);
    merged.pom = Object.keys(pomsTable).map((k) => pomsTable[k]);
    merged.filenames = new Array(...filenamesSet);
    merged.urls = new Array(...urlsSet);

    return merged;
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
        var jarInfo = {
            urls: [url],
            pom: getPOMList(pom)
        };

        downloadToTempFile(url)
        .then(fileInfo => {
            jarInfo.filenames = [fileInfo.filename];

            return getSHA256Hash(fileInfo.path)
            .then(hash => {
                jarInfo.id = hash;

                return wdd.get(hash)
                .then(ji => {
                    console.log(JSON.stringify([jarInfo, ji]));
                    jarInfo = mergeJarInfo(jarInfo, ji);

                    if (!equalJarInfo(jarInfo, ji)) {
                        console.log(JSON.stringify([jarInfo, ji]));
                        wdd.update(jarInfo);
                    }
                })
                .catch(err => {
                    return getManifestFromPath(fileInfo.path)
                    .then(contents => {
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
        .catch(report => {
            reject(report);
        });
    });
};

module.exports = checkJar;
