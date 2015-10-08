'use strict';

import UniversalEvents from 'universalevents';

export default class DeviceManager {

    constructor() {
        this.events = new UniversalEvents([
            'audioAndVideoAccepted',
            'audioAndVideoRejected'
        ]);
    }

    requestAudioAndVideo() {
        var events = this.events;

        navigator.getUserMedia(
            {
                audio: true,
                video: true
            },
            function (stream) {
                console.log(stream);
                events.emit('audioAndVideoAccepted', stream);
            },
            function (err) {
                events.emit('audioAndVideoRejected', err);
            }
        );

        return events.await('audioAndVideoAccepted', 'audioAndVideoRejected')
    }
}