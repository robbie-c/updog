var React = require('react');

if (typeof window !== 'undefined') {
    var ChatManager = require('../client/webrtc/ChatManager');
}

var VideoArea = React.createClass({

    getInitialState: function() {
        return {
            participants: {}
        }
    },

    render: function () {

        console.log(this.state.participants);

        return (
            <div>
                <video id="localVideo"></video>
                <div id="remoteVideos"></div>
                <button onClick={this.startRealTimeAV}>Join real-time AV</button>
                <div>
                    <ul>
                        {
                            Object.keys(this.state.participants).map(function(participantId){
                                return (<li key={participantId}>{participantId}</li>);
                            })
                        }
                    </ul>
                </div>
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

        this.chatManager.events.on('roomJoined', function(roomData) {
            self.setState({participants: roomData.participants});
        });

        this.chatManager.events.on('roomDataChanged', function(roomData) {
            self.setState({participants: roomData.participants});
        });

        console.log('chatManager started');
    },

    startRealTimeAV: function () {
        var self = this;

        this.chatManager.startRealTimeAV();

        this.chatManager.events.on('localMediaStarted', function(stream) {
            console.log(stream);
            self.localVideo.src = window.URL.createObjectURL(stream);
        });

        this.chatManager.events.on('participantsChanged', function(newParticipants) {
            console.log(newParticipants);
            this.setState({
                participants: newParticipants
            })
        })
    }
});

module.exports = VideoArea;
