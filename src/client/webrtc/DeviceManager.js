'use strict';

/* global navigator: false */

var UniversalEvents =require('universalevents');

var logger = require('../../common/logger');

class DeviceManager {

    constructor(initialRoom) {
        this.events = new UniversalEvents([
            'audioAndVideoAccepted',
            'audioAndVideoRejected'
        ]);
        this.room = initialRoom;
        this.userMediaRequested = false;
        this.stream = null;
    }

    requestAudioAndVideo() {
        var self = this;

        var events = this.events;

        if (this.stream) {
            return Promise.resolve(this.stream);
        }

        // TODO allow retrying if the users says no

        if (!this.userMediaRequested) {
            this.userMediaRequested = true;
            navigator.getUserMedia(
                {
                    audio: true,
                    video: this.room.settings.video
                },
                function (stream) {
                    self.stream = stream;
                    events.emit('audioAndVideoAccepted', stream);
                },
                function (err) {
                    events.emit('audioAndVideoRejected', err);
                }
            );
        }

        return events.await('audioAndVideoAccepted', 'audioAndVideoRejected')
    }
}

module.exports = DeviceManager;
