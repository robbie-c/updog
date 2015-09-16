var React = require('react');

var VideoArea = React.createClass({
    render: function() {
        return (
            <div>
                <video id="localVideo"></video>
                <div id="remoteVideos"></div>
            </div>
        );

    }
});

module.exports = VideoArea;
