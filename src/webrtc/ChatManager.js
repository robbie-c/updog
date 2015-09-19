// TODO need to think about server restarts

var Q = require('q');

if (typeof window !== 'undefined') {
    var adaptor = require('webrtc-adapter');
    var io = require('io');

    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia || navigator.msGetUserMedia;
}

var defaultConfig = {
    url: 'https://localhost:3000' // TODO
};


function startWebRTCConnectionNow() {
    console.log('start webrtc now');
}

function startWebRTCConnectionWhenReady() {
    if (this.socketConnected) {
        startWebRTCConnectionNow();
    } else {
        this.startSocket();
        this.on('socketConnected', startWebRTCConnectionNow);
    }
}

function ChatManager() {
    var self = this;

    // add event listener logic
    this.eventListeners = {
        socketConnected: [],
        chatStarted: []
    };

    this.addEventListener = function (eventName, handler) {
        if (!this.eventListeners.hasOwnProperty(eventName)) {
            throw new Error('Unknown event name: ' + eventName)
        }

        this.eventListeners[eventName].push(handler);
    };
    this.on = this.addEventListener;

    this.raiseEvent = function (eventName, args) {

        if (!this.eventListeners.hasOwnProperty(eventName)) {
            throw new Error('Unknown event name: ' + eventName)
        }

        var handlers = this.eventListeners[eventName];

        for (var i = 0; i < handlers.length; i++) {
            handlers[i].apply(this, args);
        }
    };

    this.config = defaultConfig; // TODO merge config
    this.serverConfig = null;

    this.socket = null;
    this.peerConnection = new adaptor.RTCPeerConnection();
    this.userAudioDefer = Q.defer();

    this.socketStarted = false;
    this.socketConnected = false;
    this.chatStarted = false;
    this.requestedUserAudio = false;

    function startSocket() {
        if (self.socketStarted) {
            return;
        }

        self.socketStarted = true;

        var socket = self.socket = io(self.config.url);

        socket.on('start', function (serverConfig) {
            console.log('start');
            self.serverConfig = serverConfig;

            self.socketConnection = true;

            self.raiseEvent('socketConnected');
        });
    }

    this.startSocket = startSocket;

    function startTextChatNow() {
        if (!self.chatStarted) {
            console.log('start chat now');

            // TODO

            self.chatStarted = true;

            self.raiseEvent('chatStarted');
        }
    }

    function startTextChatWhenReady() {
        if (self.socketConnected) {
            startTextChatNow();
        } else {
            self.startSocket();
            self.on('socketConnected', startTextChatNow);
        }
    }

    this.startTextChat = startTextChatWhenReady;

    function requestUserAudio() {
        if (!self.requestedUserAudio && !self.userAudioDefer.promise.isFulfilled()) {
            navigator.getUserMedia(
                {audio: true},
                function (stream) {
                    self.userAudioDefer.resolve(stream);
                },
                function (err) {
                    self.userAudioDefer.rejected(err);
                }
            );
        }
    }

    function cancelUserAudioRequest() {
        if (self.requestedUserAudio) {
            self.userAudioDefer.rejected()
        }
    }

    function startAudioWhenReady() {
        requestUserAudio();
    }


    this.startAudio = startAudioWhenReady;

}

module.exports = ChatManager;