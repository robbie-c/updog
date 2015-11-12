var PageConnector = require('./PageConnector');
var events = require('../../common/constants/events');


class RoomConnector extends PageConnector {
    constructor(config, extraEvents) {
        super(config, [
            events.ROOM_JOINED,
            events.ROOM_DATA_CHANGED,
            events.WEBRTC_PEER_MESSAGE
        ].concat(extraEvents));

        // TODO the logic from SocketController should go here
    }
}

module.exports = PageConnector;
