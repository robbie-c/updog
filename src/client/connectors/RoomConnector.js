var PageConnector = require('./PageConnector');
var events = require('../../common/constants/events');
var logger = require('../../common/logger');

var url = require('../url');

var defaultConfig = {
    roomName: url.getRoomNameFromURL()
};

class RoomConnector extends PageConnector {
    constructor(config, extraEvents) {
        super(config, [
            events.DID_JOIN_ROOM,
            events.FAILED_JOIN_ROOM,
            events.ROOM_DATA_CHANGED,
            events.WEBRTC_PEER_MESSAGE,
            events.WEBRTC_PEER_CONNECTION_CONFIG
        ].concat(extraEvents));

        this.roomName = this.config.roomName || defaultConfig.roomName;

        // TODO the logic from SocketController should go here

        var _this = this;
        var socket = this.socket;

        socket.on(events.START, function (serverData) {
            _this.emit(events.WEBRTC_PEER_CONNECTION_CONFIG, serverData.peerConnectionConfig);

            socket.emit(events.REQUEST_JOIN_ROOM, _this.roomName, function (roomData) {
                _this.emit(events.DID_JOIN_ROOM, roomData);
            });
        });

        socket.on(events.FAILED_JOIN_ROOM, function(reason) {
            _this.emit(events.FAILED_JOIN_ROOM);
        });

        socket.on(events.ROOM_DATA_CHANGED, function (roomData) {
            _this.emit(events.ROOM_DATA_CHANGED, roomData);
        });

        socket.on(events.WEBRTC_PEER_MESSAGE, function (message) {
            _this.emit(events.WEBRTC_PEER_MESSAGE, message);
        });
    }

    sendWebRTCPeerMessage(message) {
        this.socket.emit(events.WEBRTC_PEER_MESSAGE, message);
    }
}

module.exports = RoomConnector;
