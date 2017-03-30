var express = require('express');
var morgan = require('morgan');
var path = require('path');

var fillTemplate = require('./fillTemplate.js');
var downloadToTempFile = require('./downloadToTempFile.js');
var errorReport = require('./errorReport.js');
var getManifestFromPath = require('./getManifestFromPath');
var getSHA256Hash = require('./getSHA256Hash');


const WeDeploy = require('wedeploy');

var showIndex = function showIndex(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
};

var respondError = (req, res, url, report) => {
    res.status(report.statusCode);

    fillTemplate(res, 'public/error.html', (doc) => {
        if (report.failureType == 'failure.cannot_parse_template') {
            return '<p>Template error: ' + JSON.stringify(err);
        }

        var title = doc.getElementsByTagName("title");

        title[0].textContent = "We could not check " + url + " :(";

        var jarFile = doc.getElementsByClassName('jar-file');
        jarFile[0].textContent = url;

        var errorType = doc.getElementsByClassName('error-type');
        errorType[0].textContent = report.failureType;

        var errorData = doc.getElementsByClassName('error-data');
        errorData[0].innerHTML = report.errorData;

        return doc;
    });
};

var respondOK = (req, res, jarInfo) => {
    fillTemplate(res, 'public/jar-info.html', (doc) => {
        var title = doc.getElementsByTagName("title");

        title[0].textContent = "Is " + jarInfo.filenames[0] + " OSGI-ready?";

        var jarHash = doc.getElementsByClassName('jar-hash');

        for (var e of jarHash) {
            e.textContent = jarInfo.id;
        }

        var jarFiles = doc.getElementsByClassName('jar-file');

        for (var e of jarFiles) {
            e.textContent = jarInfo.filenames[0];
        }

        var jarURLs = doc.getElementsByClassName('jar-urls');

        jarURLs[0].innerHTML = '<li>' + jarInfo.urls[0] + '</li>';

        var jarIsOSGi = doc.getElementsByClassName('jar-is-osgi');

        jarIsOSGi[0].innerHTML = ""+ jarInfo.osgiready;

        return doc;
    });
};

var checkJar = function (req, res) {
    var url = req.query.url;

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
            var data = WeDeploy.data('http://data.itjor.wedeploy.io');

            return data.get('jar/'+hash)
            .then((ji) => {
                Object.assign(jarInfo, ji);
            })
            .catch((err) => {
                return getManifestFromPath(fileInfo.path)
                .then((contents) => {
                    var soughtKey = "\nBundle-SymbolicName:"
                    contents = "\n" + contents;
                    jarInfo.osgiready = contents.includes(soughtKey);

                    data.create('jar', {
                        id: jarInfo.id,
                        filenames: jarInfo.filenames,
                        osgiready: jarInfo.osgiready,
                        urls: jarInfo.urls,
                        pom: [
                            {
                                groupId: null,
                                artifactId: null,
                                version: null
                            }
                        ]
                    })
                    .then((a) => {
                        console.log('document created', a);
                    }).catch((b) => {
                        console.error('error', b);
                    });
                });
            })
        });
    })
    .then(() => {
        respondOK(req, res, jarInfo);
    })
    .catch((report) => {
        respondError(req, res, url, report);
    });;
};

var app = express();

app.use(morgan('combined'));

app.get('/', showIndex);

app.get('/isit', checkJar);

app.listen(80, function () {
  console.log('Listening on port 80');
});

