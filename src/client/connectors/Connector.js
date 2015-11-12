import UniversalEvents from 'universalevents';

var io = require('socket.io-client');

var events = require('../../common/constants/events');
var logger = require('../../common/logger');

var defaultConfig = {
    url: window.location.origin
};

class Connector extends UniversalEvents {
    constructor(config, extraEvents) {
        var myEvents = [
            events.START
        ];
        super(myEvents.concat(extraEvents || []));
        var _this = this;

        config = this.config = config || {};

        var socket = this.socket = io(config.url || defaultConfig.url);

        socket.on(events.CONNECT, function () {
            socket.on(events.START, function (serverData) {
                _this.emit(events.START, serverData.mySocketId)
            });
        });
    }
}

module.exports = Connector;
