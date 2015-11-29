var React = require('react');

var ChatMessage = React.createClass({
    render: function () {
        return (
            <p>{this.props.chatMessage.contents}</p>
        );
    }
});

module.exports = ChatMessage;
