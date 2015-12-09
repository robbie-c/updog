#!/usr/bin/env node
'use strict';
require('babel-core/register');

var debug = require('debug')('testwebrtc:server');
var fs = require('fs');
var http = require('http');
var https = require('https');
var net = require('net');

var app = require('./server/server');
var signalling = require('./server/signalling');

var basePort = normalizePort(process.env.PORT || '3000');

app.set('port', basePort);

var httpServer = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
    httpServer.listen(basePort);
    signalling(httpServer);
} else {
    var httpsOptions = {
        key: fs.readFileSync('./src/dev/dev.key'),
        cert: fs.readFileSync('./src/dev/dev.crt')
    };
    var httpsServer = https.createServer(httpsOptions, app);
    var netServer = net.createServer(tcpConnection);

    var httpPort = basePort + 1;
    var httpsPort = basePort + 2;

    netServer.listen(basePort);
    httpServer.listen(httpPort);
    httpsServer.listen(httpsPort);
    signalling(httpsServer);
}

[netServer, httpServer, httpsServer].forEach(function (server) {
    if (server) {
        server.on('error', onError.bind(server));
        server.on('listening', onListening.bind(server));
    }
});

function tcpConnection(conn) {
    conn.once('data', function (buf) {
        // A TLS handshake record starts with byte 22.
        var address = (buf[0] === 22) ? httpsPort : httpPort;
        var proxy = net.createConnection(address, function () {
            proxy.write(buf);
            conn.pipe(proxy).pipe(conn);
        });
    });
}

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof basePort === 'string'
        ? 'Pipe ' + basePort
        : 'Port ' + basePort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var server = this;
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
