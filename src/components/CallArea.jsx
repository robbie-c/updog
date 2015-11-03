var React = require('react');
var _ = require('underscore');

var logger = require('../common/logger');

if (typeof window !== 'undefined') {
    var ChatManager = require('../client/webrtc/ChatManager');
}

var RemoteVideo = require('./RemoteVideo.jsx');

var VideoArea = React.createClass({

    getInitialState: function () {
        return {
            participants: {},
            streams: {}
        }
    },

    render: function () {
        var self = this;
        logger.info('participants', this.state.participants);
        logger.info('streams', this.state.streams);

        return (
            <div>
                <h1>Remote Video</h1>

                <div id="remoteVideos">
                    {
                        Object.keys(this.state.streams).map(function (peerSocketId) {
                            var stream = self.state.streams[peerSocketId];
                            return (
                                <RemoteVideo key={peerSocketId}
                                             stream={stream}
                                             peerSocketId={peerSocketId}>
                                </RemoteVideo>
                            );
                        })
                    }
                </div>
                <h1>Local Video</h1>
                <video id="localVideo" muted={true}></video>
                <div>
                    <ul>
                        {
                            Object.keys(this.state.participants).map(function (participantId) {
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
        this.localVideo.onloadedmetadata = function () {
            self.localVideo.play();
        };

        this.chatManager = new ChatManager();
        this.chatManager.startTextChat();

        this.chatManager.events.on('roomJoined', function (roomData) {
            self.setState({participants: roomData.participants});
        });

        this.chatManager.events.on('roomDataChanged', function (roomData) {
            self.setState({participants: roomData.participants});
        });

        logger.info('chatManager started');

        // TODO do this on a button click, right now doesn't actually work
        this.startRealTimeAV();
    },

    startRealTimeAV: function () {
        var self = this;

        this.chatManager.startRealTimeAV();

        this.chatManager.events.on('localMediaStarted', function (stream) {
            logger.info('local media stream', stream);
            self.localVideo.src = window.URL.createObjectURL(stream);
        });

        this.chatManager.events.on('remoteStreamAdded', function (data) {
            var peerSocketId = data.peerSocketId;
            var stream = data.stream;
            logger.info(peerSocketId, stream);

            var oldStreams = self.state.streams;

            var newStreamObj = {};
            newStreamObj[peerSocketId] = stream;
            var newStreams = _.extend(newStreamObj, oldStreams);

            logger.info('oldStreams', oldStreams);
            logger.info('newStreams', newStreams);
            self.setState({
                streams: newStreams
            })
        });

        this.chatManager.events.on('remoteStreamRemoved', function (data) {
            var peerSocketId = data.peerSocketId;
            logger.info('remove stream from call area', peerSocketId);

            var oldStreams = self.state.streams;

            var newStreamObj = _.extend({}, oldStreams);
            delete newStreamObj[peerSocketId];

            logger.info('oldStreams', oldStreams);
            logger.info('newStreams', newStreamObj);
            self.setState({
                streams: newStreamObj
            })
        });
    }
});

module.exports = VideoArea;
