var React = require('react');

if (typeof window !== 'undefined') {
    var SimpleWebRtc = require('simplewebrtc');
}

var ChatManager = require('../webrtc/ChatManager');

var VideoArea = React.createClass({

    render: function () {
        return (
            <div>
                <video id="localVideo"></video>
                <div id="remoteVideos"></div>
                <button onClick={this.startAudio}>Start Audio</button>
            </div>
        );
    },

    componentDidMount: function () {

        this.chatManager = new ChatManager();
        this.chatManager.startTextChat();

        console.log("chatManager started");
    },

    startAudio: function () {
        this.chatManager.startAudio();
    }


});

module.exports = VideoArea;
