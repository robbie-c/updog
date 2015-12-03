var React = require('react');
var _ = require('underscore');

var logger = require('../common/logger');
var events = require('../common/constants/events');

if (typeof window !== 'undefined') {
    var DeviceManager = require('../client/webrtc/DeviceManager');
    var PeerManager = require('../client/webrtc/PeerManager');
}

var RemoteVideo = require('./RemoteVideo.jsx');

var VideoArea = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser,
            room: this.props.initialRoom,
            participants: {},
            streams: {},
            peerState: {}
        }
    },

    render: function () {
        var self = this;

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
                <video id="localVideo" muted={true}/>
                <div>
                    <ul>
                        {
                            Object.keys(this.state.participants).map(function (participantId) {
                                return (<li key={participantId}>{participantId}</li>);
                            })
                        }
                    </ul>
                </div>
                <div>
                    <ul>
                        {
                            Object.keys(this.state.peerState).map(function (participantId) {
                                return (<li key={'peerState-' + participantId}>{participantId + ': ' + self.state.peerState[participantId]}</li>);
                                })
                            }
                    </ul>
                </div>

            </div>
        );
    },

    componentDidMount: function () {
        var _this = this;
        var connector = this.props.connector;

        this.localVideo = document.querySelector('#localVideo');
        this.localVideo.onloadedmetadata = function () {
            _this.localVideo.play();
        };

        this.deviceManager = new DeviceManager(this.state.room);
        this.peerManager = new PeerManager(connector, this.state.room, this.deviceManager);

        connector.on(events.DID_JOIN_ROOM, function (roomData) {
            _this.setState({participants: roomData.participants});
        });

        connector.on(events.ROOM_DATA_CHANGED, function (roomData) {
            _this.setState({participants: roomData.participants});
        });

        this.peerManager.on(events.PEER_STATE_CHANGED, function(state) {
            _this.setState({peerState: state});
        });

        // TODO do this on a button click, right now doesn't actually work
        this.startRealTimeAV();

        // for debug
        window.connector = connector;
        window.devicemanager = this.deviceManager;
        window.peerManager = this.peerManager;
    },

    startRealTimeAV: function () {
        var self = this;

        this.deviceManager.requestAudioAndVideo()
            .then(function(stream) {
                self.localVideo.src = window.URL.createObjectURL(stream);
            });

        this.peerManager.on(events.PEER_STREAM_ADDED, function (data) {
            var peerSocketId = data.peerSocketId;
            var stream = data.stream;
            logger.info(peerSocketId, stream);

            var oldStreams = self.state.streams;

            var newStreamObj = {};
            newStreamObj[peerSocketId] = stream;
            var newStreams = _.extend(newStreamObj, oldStreams);

            self.setState({
                streams: newStreams
            })
        });

        this.peerManager.on(events.PEER_STREAM_REMOVED, function (data) {
            var peerSocketId = data.peerSocketId;

            var oldStreams = self.state.streams;

            var newStreamObj = _.extend({}, oldStreams);
            delete newStreamObj[peerSocketId];

            self.setState({
                streams: newStreamObj
            })
        });
    }
});

module.exports = VideoArea;
