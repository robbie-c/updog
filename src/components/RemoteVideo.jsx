var React = require('react');

var RemoteVideo = React.createClass({

    render: function () {
        var self = this;
        return (
            <video ref={(video) => self._video = video.getDOMNode()}>
            </video>
        );
    },

    componentDidMount: function () {
        var self = this;
        console.log('rendering video', this.props.stream);
        var url = URL.createObjectURL(this.props.stream);

        console.log('url', url);
        console.log('this._video', this._video);
        this._video.src = url;
        this._video.onloadedmetadata = function(e) {
            self._video.play();
        };
    }

});

module.exports = RemoteVideo;