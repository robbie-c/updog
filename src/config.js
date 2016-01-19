var os = require('os');
var merge = require('deepmerge');

var logger = require('./common/logger');

var hostname = os.hostname();

logger.info('loading config for', hostname);

var config = {
    sessionSecret: 'dOvgrWZJBeB41k72HAinaFRTRC3fc5ix',
    tokenSecret: 'PovEvCithek3PovEvCithek3haunEbwib1',
    postgres: {
        host: 'ec2-54-217-202-109.eu-west-1.compute.amazonaws.com',
        port: 5432,
        database: 'd31jqimr8d6bdl',
        user: 'uqlgahxmefmvcx',
        pass: '8MYhGqRLKi053eSASkgfumzM9L'
    },
    redis: {
        host: 'pub-redis-16317.us-east-1-2.5.ec2.garantiadata.com',
        port: 16317,
        pass: 'KabiRjTkm2tfCN57Lj3NcAR4jyJby6j7'
    },
    mongo: {
        url: 'mongodb://updog:8IhiLQ0ZycWoYDNyKVelQOwqQ9o39uoy@ds041563.mongolab.com:41563/updog'
    },
    googleAuth: {
        clientId: '640683349524-fhi7nh4ubqe9fogpchb0l6b462psd4ff.apps.googleusercontent.com',
        clientSecret: 'LONIGF0jmbcZHseZmDC1KZtl',
        callbackURL: '/auth/google/callback'
    },
    iceServers: [
        /*
        {
            urls: 'turn:104.155.75.9:5349',
            username: 'updog',
            credential: 'testingPasswordForWIPYp11fY1JSHefiI40FWwFJnUpdXjqDux2'
        },
        {
            urls: 'turn:numb.viagenie.ca',
            credential: 'updogftw',
            username: 'robbie.coomber@gmail.com'
        },
        */
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'turn:130.211.59.162',
            username: 'updog',
            credential: 'HudpeHev978234kjhsdfkjh'
        }
    ]
};

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

