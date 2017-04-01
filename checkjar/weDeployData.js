const WeDeploy = require('wedeploy');

var _data;
var _getData = () => {
    if (!_data) {
        _data = WeDeploy.data('http://data.itjor.wedeploy.io');
    }

    return _data
};

var create = (jarInfo) => {
    var ji = {};
    Object.assign(ji, jarInfo);

    _getData().create('jar', ji)
    .then((a) => {
        console.log('document created', a);
    }).catch((b) => {
        console.error('error', b);
    });
};

var get = (hash) => {
    return _getData().get('jar/'+hash);
};

exports.create = create;
exports.get = get;
