'use strict';

import UniversalEvents from 'universalevents';

var io = require('io');
var _ = require('underscore');

export default class SocketManager extends UniversalEvents {
/**
 *
 * @param {ChatManager} parentChatManager
 *
 */
    constructor(parentChatManager) {
        super([
            'socketConnected',
            'roomJoined',
            'roomDataChanged',
            'webrtc peer message'
        ]);
        this.parentChatManager = parentChatManager;
        this.started = false;
        this.connected = false;
        this.socket = null;

        this._roomDataCache = null;
    }

    start() {
        var self = this;
        this.started = true;

        var socket = this.socket = io(this.parentChatManager.config.url);

        socket.on('connect', function(data) {
            console.log(data);
            console.log('connected');
        });

        socket.on('start', function (serverData) {
            console.log('start socket');

            self.connected = true;

            socket.emit('join', self.parentChatManager.config.roomName, function(roomData) {
                console.log('room joined');
                self._roomDataCache = roomData;
                super.emit('roomJoined', roomData);
            });

            console.log('mySocketId', serverData.mySocketId);

            super.emit('socketConnected', serverData);
        });

        socket.on('room data', function(roomData) {
            if (!_.isEqual(roomData, self._roomDataCache)) {
                console.log('room data changed', roomData, self._roomDataCache);
                self._roomDataCache = roomData;
                super.emit('roomDataChanged', roomData);
            } else {
                console.log('room data not changed');
            }
        });

        socket.on('webrtc peer message', function(message) {
            console.log('received webrtc peer message');
            super.emit('webrtc peer message', message);
        })
    }

    sendWebRTCPeerMessage(message) {
        this.socket.emit('webrtc peer message', message);
    }
}