var React = require('react');

if (typeof window !== 'undefined') {
    var ChatManager = require('../client/webrtc/ChatManager');
}

var VideoArea = React.createClass({

    render: function () {
        return (
            <div>
                <video id="localVideo"></video>
                <div id="remoteVideos"></div>
                <button onClick={this.startRealTimeAV}>Join real-time AV</button>
            </div>
        );
    },

    componentDidMount: function () {
        var self = this;
        this.localVideo = document.querySelector('#localVideo');
        this.localVideo .onloadedmetadata = function(e) {
            self.localVideo.play();
        };

        this.chatManager = new ChatManager();
        this.chatManager.startTextChat();

        console.log('chatManager started');
    },

    startRealTimeAV: function () {
        var self = this;

        this.chatManager.startRealTimeAV();

        this.chatManager.events.on('localMediaStarted', function(stream) {
            console.log(stream);
            self.localVideo.src = window.URL.createObjectURL(stream);
        })
    }
});

module.exports = VideoArea;
