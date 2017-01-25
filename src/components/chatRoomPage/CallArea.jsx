import * as React from 'react';
var _ = require('underscore');

var logger = require('../../common/logger');
var events = require('../../common/constants/events');

if (typeof window !== 'undefined') {
    var DeviceManager = require('../../client/webrtc/DeviceManager');
    var PeerManager = require('../../client/webrtc/PeerManager');
}

var RemoteVideo = require('./RemoteVideo.jsx');

var VideoArea = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser,
            room: this.props.initialRoom,
            streams: {}
        }
    },

    render: function () {
        var self = this;

        var isVisible = !!this.state.room.settings.video;

        return (
            <div className={isVisible ? "" : "hidden"}>
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
                <video id="localVideo" muted={true} ref={self.setUpLocalVideo}/>
            </div>
        );
    },

    setUpLocalVideo(localVideoElement) {
        if (this.localVideoElement !== localVideoElement) {
            localVideoElement.play();
        }
        this.localVideoElement = localVideoElement;
        localVideoElement.onloadedmetadata = function () {
            localVideoElement.play();
        };
    },

    componentDidMount: function () {
        var connector = this.props.connector;

        this.deviceManager = new DeviceManager(this.state.room);
        this.peerManager = new PeerManager(connector, this.state.room, this.deviceManager);

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
                self.localVideoElement.src = window.URL.createObjectURL(stream);
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

export default VideoArea;
