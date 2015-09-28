var os = require('os');
var merge = require('deepmerge');

var hostname = os.hostname();

var config = {
    sessionSecret: 'dOvgrWZJBeB41k72HAinaFRTRC3fc5ix'
};

if (/saffron/.test(hostname)) {
    config = merge(config, {
        redis: {
            host: '127.0.0.1',
            port: 6379,
            pass: '5jVZsi3nrW3DagacyUQu8xzK8rWreCh1'
        },
        mongo: {
            url: 'mongodb://127.0.0.1/updog'
        }
    })
}

module.exports = config;

