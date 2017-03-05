var jsdom = require("jsdom");

var fillTemplate = (res, path, filler) => {
    jsdom.env({
        file: path,
        FetchExternalResources: false,
        ProcessExternalResources: false,
        done: (err, window) => {
            if (err) {
                report = errorReport(
                    err, 'failure.cannot_parse_template', 500,
                    'Failed to parse template ' + path + ': ' + err);

                res.status(report.statusCode);
                res.write(fillErrorPage(null, url, report));

                res.end();
                window.close();

                return;
            }

            var doc = window.document;

            content = filler(doc);

            res.write(jsdom.serializeDocument(content));
            res.end();
            window.close();
        }
    });
};

module.exports = fillTemplate;
