var express = require('express');
var morgan = require('morgan');
var path = require('path');

var fillTemplate = require('./fillTemplate.js');
var errorReport = require('./errorReport.js');
var checkJar = require('./checkJar.js');

var wdd = require('./weDeployData');

var showIndex = function showIndex(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
};

var respondError = (req, res, url, report) => {
    res.status(report.statusCode);

    fillTemplate(res, 'public/error.html', (doc) => {
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

        var urlsInnerHTML  = '';
        for (var url of jarInfo.urls) {
            urlsInnerHTML = urlsInnerHTML + '<li>' + url + '</li>';
        }

        jarURLs[0].innerHTML = urlsInnerHTML;

        var jarIsOSGi = doc.getElementsByClassName('jar-is-osgi');

        jarIsOSGi[0].innerHTML = yesNoSpan(jarInfo);

        return doc;
    });
};

var respondAll = (req, res, jarInfos) => {
    fillTemplate(res, 'public/all.html', (doc) => {
        var jarTable = doc.getElementsByClassName('jar-infos')[0];
        var jarRow = jarTable.getElementsByClassName('jar-row')[0];
        jarRow.remove();
        for (var ji of jarInfos) {
            var row = jarRow.cloneNode(true);
            var filename = row.getElementsByClassName('filename')[0];
            filename.textContent = ji.filenames[0];
            var isOSGi = row.getElementsByClassName('jar-is-osgi')[0];
            isOSGi.innerHTML = yesNoSpan(ji);
            var moreInfo = row.getElementsByClassName('more-info')[0];
            moreInfo.innerHTML = '<a href="/isit?url=' + ji.urls[0] + '">See more</a>';
            jarTable.appendChild(row);
        }

        return doc;
    });
};

var yesNoSpan = function(jarInfo) {
  if (jarInfo.osgiready) {
    return '<span class="label label-success">yes</span>';
  } else {
    return '<span class="label label-danger">no</span>';
  }
}

var checkURL = function (req, res) {
    var url = req.query.url;

    checkJar(url)
    .then((jarInfo) => {
        respondOK(req, res, jarInfo);
    })
    .catch((report) => {
        respondError(req, res, url, report);
    });
}

var checkPOM = (req, res) => {
    var groupId = req.query.groupId;
    var artifactId = req.query.artifactId;
    var version = req.query.version;

    var filepath = path.join(
        groupId.replace('.', '/'), artifactId, version,
        artifactId + '-' + version + '.jar'
    );

    var url = 'http://search.maven.org/remotecontent?filepath='+filepath;

    checkJar(url, groupId, artifactId, version)
    .then((jarInfo) => {
        respondOK(req, res, jarInfo);
    })
    .catch((report) => {
        respondError(req, res, url, report);
    });
};

var showAll = (req, res) => {
  wdd.all()
  .then((jarInfos) => {
    respondAll(req, res, jarInfos);
  });
};

var app = express();

app.use(morgan('combined'));

app.get('/', showIndex);

app.get('/isit', checkURL);
app.get('/pomit', checkPOM);
app.get('/all', showAll);


var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port 80');
});