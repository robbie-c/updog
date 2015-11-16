var session = require("express-session");
var socketIO = require('socket.io');
var passport = require('passport');
require('./passport/passport')(passport);

var logger = require('../common/logger');

var config = require('../config');
var redisClient = require('./redisClient');
var pubsub = require('./pubsub');
var events = require('../common/constants/events');

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
        this.selfUserSubscription = pubsub.user.subscribe(user.id, function (err, newUser) {
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

        client.on(events.WEBRTC_PEER_MESSAGE, function (details) {
            if (!details) {
                logger.info('empty message!');
                return;
            }

            if (!details.to) {
                logger.info('no to field specified!');
                return;
            }

            if (!client.room) {
                logger.info('client not in a room!');
                return;
            }

            var otherClient = io.sockets.adapter.nsp.connected[details.to];
            if (!otherClient) {
                logger.info('couldnt find other client');
                return;
            }

            // ensure they are in the same room
            if (!client.room || client.room !== otherClient.room) {
                logger.info('wrong room');
                return;
            }

            // TODO ensure client can speak to that person

            details.from = client.id;
            otherClient.emit(events.WEBRTC_PEER_MESSAGE, details);
        });

        client.on('disconnect', function () {
            if (client.room) {
                var roomData = getRoomData(client.room);
                io.to(client.room).emit(events.ROOM_DATA_CHANGED, roomData);
            }

            if (client.selfUserSubscription) {
                client.selfUserSubscription.close();
                client.selfUserSubscription = null;
            }
        });

        client.on(events.REQUEST_JOIN_ROOM, function (name, cb = noOp) {

            logger.info('join', name);

            if (!name) {
                client.emit(events.FAILED_JOIN_ROOM, 'room.name.invalid');
                return;
            }

            // TODO check that user has permission to join
            client.join(name);
            client.room = name;

            var roomData = getRoomData(name);

            cb(roomData);

            io.to(name).emit(events.ROOM_DATA_CHANGED, roomData);
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

    function getRoomData(roomName) {
        var participants = {};
        var room = findClientsSocketByRoomId(roomName);
        room.forEach(function (client) {
            participants[client.id] = {};
        });
        return {
            participants: participants
        }
    }

    function findClientsSocketByRoomId(roomName) {
        var res = [];
        var room = io.sockets.adapter.rooms[roomName];
        if (room) {
            Object.keys(room).forEach(function (id) {
                res.push(io.sockets.adapter.nsp.connected[id]);
            });
        }
        return res;
    }

    return io;
}

module.exports = setUpSignalling;
