var socketIO = require('socket.io');

if (typeof localStorage !== 'undefined') {
    localStorage.debug = '*';
}


function noOp() {}

function setUpSignalling(server) {
    var io = socketIO.listen(server);

    io.on('connection', function (client) {
        client.resources = {
            audio: true,
            video: false,
            screen: false
        };

        client.on('webrtc peer message', function (details) {
            if (!details) return;

            if (!details.to) {
                console.log('no to field specified!');
                return
            }

            if (!client.room) {
                console.log('client not in a room!');
                return
            }

            var otherClient = io.sockets.adapter.nsp.connected[details.to];
            if (!otherClient)
            {
                console.log('couldnt find other client');
                return;
            }

            // ensure they are in the same room
            if (!client.room || client.room !== otherClient.room) {
                console.log('wrong room');
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
        });

        client.on('join', function (name, cb=noOp) {

            console.log('join');

            // TODO check that name is sane
            client.join(name);
            client.room = name;

            var roomData = getRoomData(name);

            cb(roomData);

            io.to(name).emit('room data', roomData);
        });

        client.on('trace', function (data) {
            console.log('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        // TODO read these from a config file
        var peerConnectionConfig = {
            //stunServers: [{"url": "stun:stun.l.google.com:19302"}],
            //turnServers: [],
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"}
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
            Object.keys(room).forEach(function(id) {
                res.push(io.sockets.adapter.nsp.connected[id]);
            });
        }
        return res;
    }

    return io;
}

module.exports = setUpSignalling;