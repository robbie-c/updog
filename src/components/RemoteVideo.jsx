var React = require('react');

var logger = require('../common/logger');

var RemoteVideo = React.createClass({

    render: function () {
        var self = this;
        return (
            <video ref={(videoReact) => self.attachStreamToVideo(videoReact)}>
            </video>
        );
    },

    attachStreamToVideo: function (videoReact) {
        if (videoReact != null) {
            logger.info('rendering video', this.props.stream);

            var url = URL.createObjectURL(this.props.stream);
            logger.info('url', url);

            var videoDOM = videoReact.getDOMNode();

            videoDOM.src = url;
            videoDOM.onloadedmetadata = function () {
                videoDOM.play();
            };
        }
    }

});

module.exports = RemoteVideo;
