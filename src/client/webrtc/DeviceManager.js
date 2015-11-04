'use strict';

import UniversalEvents from 'universalevents';

var logger = require('../../common/logger');

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
        this.stream = null;
    }

    requestAudioAndVideo() {
        var self = this;

        logger.info('request audio and video');
        var events = this.events;

        if (this.stream) {
            logger.info('already got the stream');
            return Promise.resolve(this.stream);
        }

        // TODO allow retrying if the users says no

        if (!this.userMediaRequested) {
            this.userMediaRequested = true;
            navigator.getUserMedia(
                {
                    audio: true,
                    video: false // TODO DIRTY HACK
                },
                function (stream) {
                    logger.info('got the local stream at device manager', stream);
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
