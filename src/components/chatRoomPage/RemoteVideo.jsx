var React = require('react');

var logger = require('../../common/logger');

var RemoteVideo = React.createClass({

    getInitialState: function() {
        return {
            hasVideo: false
        };
    },

    render: function () {
        return (
            <div>
                <div className={this.state.hasVideo ? "" : "hide"}>
                    {this.videoNode}
                </div>
                <div className={this.state.hasVideo ? "hide" : ""}>No video</div>
            </div>
        );
    },

    componentDidMount: function () {
        var _this = this;
        this.videoNode = (<video ref={(videoDOMNode) => _this._attachStream(videoDOMNode)}/>);
    },

    _attachStream: function(videoDOMNode) {
        var _this = this;

        if (videoDOMNode) {
            var url = URL.createObjectURL(this.props.stream);

            logger.info('url', url);

            videoDOMNode.src = url;
            videoDOMNode.onloadedmetadata = function () {
                _this.setState({
                    hasVideo: true
                });
                videoDOMNode.play();
            };
        }
    }
});

module.exports = RemoteVideo;
