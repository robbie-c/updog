var socketIO = require('socket.io');

function setUpSignalling(server) {
    var io = socketIO.listen(server);

    io.on('connection', function (client) {
        client.resources = {
            audio: true,
            video: false,
            screen: false
        };

        client.on('direct message', function (details) {
            if (!details) return;

            var otherClient = io.sockets.sockets[details.to];
            if (!otherClient) return;

            // TODO ensure client can speak to that person

            details.from = client.id;
            otherClient.emit('direct message', details);
        });

        client.on('room message', function (details) {
            if (client.room) {
                io.to(client.room).emit('room message', details);
            }
        });

        client.on('disconnect', function () {
            if (client.room) {
                io.sockets.in(client.room).emit('remove', {
                    id: client.id
                });
            }
        });

        client.on('join', function (name, cb) {

            // TODO check that name is sane
            client.join(name);
            client.room = name;

            cb('success');
        });

        client.on('trace', function (data) {
            console.log('trace', JSON.stringify(
                [data.type, data.session, data.prefix, data.peer, data.time, data.value]
            ));
        });

        // TODO read these from a config file
        var serverConfig = {
            stunServers: [{"url": "stun:stun.l.google.com:19302"}],
            turnServers: []
        };

        client.emit('start', serverConfig);
    });

    return io;
}

module.exports = setUpSignalling;