var React = require('react');

var logger = require('../../common/logger');

var ChatMessage = React.createClass({

    render: function () {
        var chatMessage = this.props.chatMessage;
        var posterUser = this.props.posterUser;

        var displayName = posterUser ? posterUser.displayName : 'anon-' + chatMessage.fromClientId;
        var dateRaw = chatMessage.serverTime ? chatMessage.serverTime : chatMessage.clientTime;
        var dateObj = new Date(dateRaw);
        var dateStr = dateObj.toISOString(); // TODO probably should format this a bit better

        return (
            <div>
                <div><p>{displayName}</p><small className='pull-right'>{dateStr}</small></div>
                <p>{this.props.chatMessage.contents}</p>
            </div>

        );
    }
});

module.exports = ChatMessage;
