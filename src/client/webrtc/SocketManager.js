'use strict';

import UniversalEvents from 'universalevents';

var io = require('io');
var _ = require('underscore');

var logger = require('../../common/logger');

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

        socket.on('connect', function (data) {
            logger.info(data);
            logger.info('connected');
        });

        socket.on('start', function (serverData) {
            logger.info('start socket');

            self.connected = true;

            socket.emit('join', self.parentChatManager.config.roomName, function (roomData) {
                logger.info('room joined');
                self._roomDataCache = roomData;
                super.emit('roomJoined', roomData);
            });

            logger.info('mySocketId', serverData.mySocketId);

            super.emit('socketConnected', serverData);
        });

        socket.on('room data', function (roomData) {
            if (!_.isEqual(roomData, self._roomDataCache)) {
                logger.info('room data changed', roomData, self._roomDataCache);
                self._roomDataCache = roomData;
                super.emit('roomDataChanged', roomData);
            } else {
                logger.info('room data not changed');
            }
        });

        socket.on('webrtc peer message', function (message) {
            super.emit('webrtc peer message', message);
        })
    }

    sendWebRTCPeerMessage(message) {
        this.socket.emit('webrtc peer message', message);
    }
}
