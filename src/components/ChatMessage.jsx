var React = require('react');

var logger = require('../common/logger');

var ChatMessage = React.createClass({

    render: function () {
        var displayName = this.props.posterUser ? this.props.posterUser.displayName : 'anon-' + this.props.chatMessage.fromClientId;

        return (
            <div>
                <div><p>{displayName}</p></div>
                <p>{this.props.chatMessage.contents}</p>
            </div>

        );
    }
});

module.exports = ChatMessage;
