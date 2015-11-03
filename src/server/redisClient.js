var session = require('express-session');
var redis = require('redis');
var RedisStore = require('connect-redis')(session);

var config = require('../config');

var logger = require('../common/logger');

var redisClient = redis.createClient(config.redis.port, config.redis.host);
redisClient.auth(config.redis.pass, function (err) {
    if (err) {
        console.error('Redis auth error: ' + err);
    } else {
        logger.info('Redis connected and authenticated');
    }
});
redisClient.on('error', function (err) {
    console.error('Redis error: ' + err);
});

var redisStore = new RedisStore({
    client: redisClient
});

module.exports = {
    client: redisClient,
    store: redisStore
};
