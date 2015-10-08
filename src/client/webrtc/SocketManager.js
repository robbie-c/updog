'use strict';

import UniversalEvents from 'universalevents';

var io = require('io');

export default class SocketManager extends UniversalEvents {

    constructor(config) {
        super([
            'socketConnected'
        ]);
        this.config = config;
        this.started = false;
        this.connected = false;
        this.socket = null;
    }

    start() {
        this.started = true;

        var socket = this.socket = io(this.config.url);

        socket.on('start', function (serverConfig) {
            console.log('start socket');

            this.connected = true;

            super.emit('socketConnected', serverConfig);
        });
    }
}