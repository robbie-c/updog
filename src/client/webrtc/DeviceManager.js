'use strict';

import UniversalEvents from 'universalevents';

export default class DeviceManager {

    /**
     *
     * @param {ChatManager} parentChatManager
     */
    constructor(parentChatManager) {
        this.events = new UniversalEvents([
            'audioAndVideoAccepted',
            'audioAndVideoRejected'
        ]);
        this.parentChatManager = parentChatManager;
        this.userMediaRequested = false;
    }

    requestAudioAndVideo() {
        console.log('request audio and video');
        var events = this.events;

        // TODO allow retrying if the users says no

        if (!this.userMediaRequested) {
            this.userMediaRequested = true;
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
        }

        return events.await('audioAndVideoAccepted', 'audioAndVideoRejected')
    }
}