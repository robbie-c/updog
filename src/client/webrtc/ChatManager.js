'use strict';

// TODO need to think about server restarts

var adaptor = require('webrtc-adapter');

import UniversalEvents from 'universalevents';

import SocketManager from './SocketManager';
import DeviceManager from './DeviceManager';

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia || navigator.msGetUserMedia;

var defaultConfig = {
    url: 'https://localhost:3000' // TODO
};

export default class ChatManager {
    constructor() {
        this.config = defaultConfig; // TODO merge config

        this.deviceManager = null;

        this.started = false;

        this.events = new UniversalEvents([
            'localMediaStarted',
            'localMediaChanged',
            'localMediaFinished'
        ]);
    }

    start() {
        this.started = true;

        this.socketManager = new SocketManager(this.config);
        this.deviceManager = new DeviceManager(this.config);

    }

    startRealTimeAV() {
        if (!this.started) {
            this.start();
        }

        this.deviceManager.requestAudioAndVideo()
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
}
