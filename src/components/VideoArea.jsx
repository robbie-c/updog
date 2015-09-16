var React = require('react');

if (typeof window !== 'undefined') {
    var SimpleWebRtc = require('simplewebrtc');
}

var VideoArea = React.createClass({
    render: function () {
        return (
            <div>
                <video id="localVideo"></video>
                <div id="remoteVideos"></div>
            </div>
        );
    },

    componentDidMount: function () {
        var webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'localVideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remoteVideos',
            // immediately ask for camera access
            autoRequestMedia: true
        });

        webrtc.on('readyToCall', function () {
            // you can name it anything
            webrtc.joinRoom('your awesome room name');
        });

        webrtc.on('videoAdded', function (video, peer) {
            console.log('video added', peer);
            var remotes = document.getElementById('remotes');
            if (remotes) {
                var container = document.createElement('div');
                container.className = 'videoContainer';
                container.id = 'container_' + webrtc.getDomId(peer);
                container.appendChild(video);

                // suppress contextmenu
                video.oncontextmenu = function () { return false; };

                remotes.appendChild(container);
            }
        });
    }
});

module.exports = VideoArea;
