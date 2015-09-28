var redis = require('redis');

var config = require('../config');

var redisClient = redis.createClient(config.redis.port, config.redis.host);
redisClient.auth(config.redis.pass, function (err) {
    if (err) {
        console.error('Redis auth error: ' + err);
    } else {
        console.log('Redis connected and authenticated');
    }
});
redisClient.on('error', function (err) {
    console.error('Redis error: ' + err);
});

module.exports = redisClient;