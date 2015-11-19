'use strict';

var session = require("express-session");
var socketIO = require('socket.io');
var passport = require('passport');
var jwt = require('jsonwebtoken');
require('./passport/passport')(passport);

var logger = require('../common/logger');

var config = require('../config');
var redisClient = require('./redisClient');
var pubsub = require('./pubsub');
var events = require('../common/constants/events');
import User from './models/user';

var roomSignaling = require('./signaling/roomSignaling');

var sessionMiddleware = session({
    store: redisClient.store,
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
});

function noOp() {
}

function clientSetSelfUser(user) {
    var _this = this;
    if (this.selfUserSubscription) {
        this.selfUserSubscription.close();
        this.selfUserSubscription = null;
    }
    if (user) {
        this.selfUserSubscription = pubsub.user.subscribe(user._id, function (err, newUser) {
            _this.user = newUser;
            _this.emit(events.SELF_USER, newUser.sanitise());
        })
    }
}

function setUpSignalling(server) {
    var io = socketIO.listen(server);

    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    io.use(function (socket, next) {
        passport.initialize()(socket.request, socket.request.res, next);
    });
    io.use(function (socket, next) {
        passport.session()(socket.request, socket.request.res, next);
    });
    io.use(function (socket, next) {
        socket.session = socket.request.session;
        socket.user = socket.request.user;
        next();
    });

    io.on('connection', function (client) {

        client.emit(events.SELF_USER, client.user);
        client.setSelfUser = clientSetSelfUser;
        client.setSelfUser(client.user);

        client.on('token', function (token, callback = noOp) {
            jwt.verify(token, config.tokenSecret, {}, function (err, data) {
                if (err) {
                    // TODO handle error
                    logger.error(err);
                } else {
                    User.findOne({_id: data.id}, function (err, user) {
                        if (err) {
                            // TODO handle error
                            logger.error(err);
                        } else {
                            client.setSelfUser(user);
                            callback(null);
                        }
                    })
                }
            })
        });

        client.on('disconnect', function () {
            if (client.selfUserSubscription) {
                client.selfUserSubscription.close();
                client.selfUserSubscription = null;
            }
        });

        client.on(events.REQUEST_JOIN_ROOM, function (name, cb = noOp) {
            roomSignaling.joinRoom(io, client, name, cb);
        });

        client.on('trace', function (data) {
            logger.info('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        var peerConnectionConfig = {
            iceServers: config.iceServers
        };

        client.emit(events.START, {
            mySocketId: client.id,
            peerConnectionConfig: peerConnectionConfig
        });
    });

    return io;
}

module.exports = setUpSignalling;
