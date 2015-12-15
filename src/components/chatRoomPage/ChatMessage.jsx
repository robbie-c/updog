var React = require('react');

var logger = require('../../common/logger');

var ChatMessage = React.createClass({

    render: function () {
        var chatMessage = this.props.chatMessage;
        var posterUser = this.props.posterUser;
        var selfUserid = this.props.selfUserId;
        var mySocketId = this.props.mySocketId;

        // TODO posted by my current user should work too
        var isSelf = mySocketId != null && mySocketId == chatMessage.fromClientId;

        logger.log(chatMessage);

        var displayName = posterUser ? posterUser.displayName : 'anon-' + chatMessage.fromClientId;
        var dateRaw = chatMessage.serverTime ? chatMessage.serverTime : chatMessage.clientTime;
        var dateObj = new Date(dateRaw);
        var dateStr = dateObj.toISOString(); // TODO probably should format this a bit better

        var chatMessageClass = "chatMessage clearfix " + isSelf ? "right" : "left";
        var imageSpanClass = isSelf ? "pull-right" : "pull-left";
        var dateSmallClass = isSelf ? "" : "pull-right";
        var displayNameClass = isSelf ? "pull-right" : "";

        return (
            <li className={chatMessageClass}>
                <span className={imageSpanClass}>Image here</span>
                <div className="clearfix">
                    <div className="header">
                        <small className={dateSmallClass}>{dateStr}</small>
                        <strong className={displayNameClass}>{displayName}</strong>
                    </div>
                </div>
                <p>{this.props.chatMessage.contents}</p>
            </li>

        );
    }
});

module.exports = ChatMessage;
