var React = require('react');

var logger = require('../../common/logger');

var ChatMessage = React.createClass({

    render: function () {
        var chatMessage = this.props.chatMessage;
        var posterUser = this.props.posterUser;

        var displayName = posterUser ? posterUser.displayName : 'anon-' + chatMessage.fromClientId;
        var date = chatMessage.serverTime ? chatMessage.serverTime : chatMessage.clientTime;
        date = Date(date);

        return (
            <div>
                <div><p>{displayName}</p><small className='pull-right'>{date}</small></div>
                <p>{this.props.chatMessage.contents}</p>
            </div>

        );
    }
});

module.exports = ChatMessage;
