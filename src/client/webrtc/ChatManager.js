'use strict';

// TODO need to think about server restarts

var adaptor = require('webrtc-adapter');

import UniversalEvents from 'universalevents';

import SocketManager from './SocketManager';
import DeviceManager from './DeviceManager';
import PeerManager from './PeerManager';

var _ = require('underscore');

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;

var defaultConfig = {
    url: 'https://localhost:3000', // TODO
    roomName: 'robbiesroom'
};

export default class ChatManager {
    constructor() {
        this.config = defaultConfig; // TODO merge config
        this.peerConnectionConfig = null;
        this.mySocketId = null;

        this.deviceManager = null;

        this.started = false;

        this.events = new UniversalEvents([
            'localMediaStarted',
            'localMediaChanged',
            'localMediaFinished',
            'roomJoined',
            'roomDataChanged',
            'remoteStreamAdded',
            'remoteStreamRemoved'
        ]);
    }

    start() {
        var self = this;

        this.started = true;
        this.roomData = {};

        this.socketManager = new SocketManager(this);
        this.deviceManager = new DeviceManager(this);
        this.peerManager = new PeerManager(this);

        this.socketManager.start();

        this.socketManager.on('socketConnected', function(serverData) {
            console.log('server data', serverData);
            self.peerConnectionConfig = serverData.peerConnectionConfig;
            self.mySocketId = serverData.mySocketId;
        });

        this.socketManager.on('roomJoined', function(roomData) {
            self.peerManager.updateParticipants(roomData.participants);
            self.events.emit('roomJoined', roomData);
        });

        this.socketManager.on('roomDataChanged', function(roomData) {
            self.roomData = roomData;
            console.log('roomData changed', roomData);
            self.peerManager.updateParticipants(roomData.participants);
            self.events.emit('roomDataChanged', roomData);
        });

        this.socketManager.on('webrtc peer message', function(message) {
            self.peerManager.receiveMessage(message);
        });
    }

    awaitLocalStream() {
        return this.deviceManager.requestAudioAndVideo();
    }

    startRealTimeAV() {
        if (!this.started) {
            this.start();
        }

        this.awaitLocalStream()
            .then((stream)=> {
                this.events.emit('localMediaStarted', stream)
            })
            .catch((err)=>{
                console.error(err);
            });
    }

    startTextChat() {
        if (!this.started) {
            this.start();
        }

        console.log('start text chat');
    }

    sendWebRTCPeerMessage(message) {
        this.socketManager.sendWebRTCPeerMessage(message);
    }

    addRemoteStream(stream, peerSocketId) {
        this.events.emit('remoteStreamAdded', {
            stream: stream,
            peerSocketId: peerSocketId
        })
    }

    removeRemoteStream(peerSocketId) {
        this.events.emit('remoteStreamRemoved', {
            peerSocketId: peerSocketId
        })
    }

}
