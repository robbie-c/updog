var React = require('react');

var logger = require('../../common/logger');

var RemoteVideo = React.createClass({

    getInitialState: function() {
        return {
            hasVideo: false,
            hasVideoReactNode: false
        };
    },

    render: function () {
        return (
            <div>
                <div className={this.state.hasVideo ? "" : "hide"}>
                    {this.videoReactNode}
                </div>
                <div className={this.state.hasVideo ? "hide" : ""}>No video</div>
            </div>
        );
    },

    componentDidMount: function () {
        var _this = this;
        this.videoReactNode = (<video autoPlay={true} className="remoteVideo" ref={(videoDOMNode) => _this._attachStream(videoDOMNode)}/>);
        this.setState({
            hasVideoReactNode: true
        });
    },

    _attachStream: function(videoDOMNode) {
        var _this = this;

        if (videoDOMNode) {
            var url = URL.createObjectURL(this.props.stream);

            logger.info('url', url);

            videoDOMNode.src = url;
            videoDOMNode.onloadedmetadata = function() {
                _this._videoElementOnLoadedMetadata(videoDOMNode);
            };
        }
    },

    _videoElementOnLoadedMetadata: function(videoDOMNode) {
        videoDOMNode.play();
        this.setState({
            hasVideo: true
        });
    }
});

module.exports = RemoteVideo;
