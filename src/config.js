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

if (/yellowstone/.test(hostname)) {
    config = merge(config, {
        redis: {
            host: 'pub-redis-16317.us-east-1-2.5.ec2.garantiadata.com',
            port: 16317,
            pass: 'KabiRjTkm2tfCN57Lj3NcAR4jyJby6j7'
        },
        mongo: {
            url: 'mongodb://updog:8IhiLQ0ZycWoYDNyKVelQOwqQ9o39uoy@ds041563.mongolab.com:41563/updog'
        }
    })
}

module.exports = config;

