var React = require('react');

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
            console.log('rendering video', this.props.stream);

            var url = URL.createObjectURL(this.props.stream);
            console.log('url', url);

            var videoDOM = videoReact.getDOMNode();
            console.log('videoDOM', videoDOM);

            videoDOM.src = url;
            videoDOM.onloadedmetadata = function () {
                videoDOM.play();
            };
        }
    }

});

module.exports = RemoteVideo;
