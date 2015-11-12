var session = require("express-session");
var socketIO = require('socket.io');
var passport = require('passport');
require('./passport/passport')(passport);

var logger = require('../common/logger');

var config = require('../config');
var redisClient = require('./redisClient');
var pubsub = require('./pubsub');

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
            _this.emit('self user', newUser.sanitise());
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

        client.emit('self user', client.user);
        client.setSelfUser = clientSetSelfUser;
        client.setSelfUser(client.user);

        client.on('webrtc peer message', function (details) {
            if (!details) return;

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
            otherClient.emit('webrtc peer message', details);
        });

        client.on('disconnect', function () {
            if (client.room) {
                var roomData = getRoomData(client.room);
                io.to(client.room).emit('room data', roomData);
            }

            if (client.selfUserSubscription) {
                client.selfUserSubscription.close();
                client.selfUserSubscription = null;
            }
        });

        client.on('join', function (name, cb = noOp) {

            logger.info('join');

            // TODO check that name is sane
            client.join(name);
            client.room = name;

            var roomData = getRoomData(name);

            cb(roomData);

            io.to(name).emit('room data', roomData);
        });

        client.on('trace', function (data) {
            logger.info('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        // TODO read these from a config file
        var peerConnectionConfig = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }, {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'updogftw',
                    username: 'robbie.coomber@gmail.com'
                }
            ]
        };


        client.emit('start', {
            mySocketId: client.id,
            peerConnectionConfig: peerConnectionConfig
        });
    });

    function getRoomData(roomName) {
        var participants = {};
        var room = findClientsSocketByRoomId(roomName);
        room.forEach(function (client) {
            participants[client.id] = client.resources;
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
