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
        var contentsClass = 'chatMessage__contents ' + (isSelf ? 'chatMessage__contents--self' : 'chatMessage__contents--other');

        return (
            <li className={chatMessageClass}>
                <span className={imageSpanClass}>
                    <span className="chatMessage__icon fa-stack fa-lg">
                        <i className="fa fa-circle-o fa-stack-2x"/>
                        <i className="fa fa-stack-1x">{displayName[0]}</i>
                    </span>
                </span>
                <div className={contentsClass}>
                    <div>
                        <div className="header">
                            <small className={dateSmallClass}>{dateStr}</small>
                            <strong className={displayNameClass}>{displayName}</strong>
                        </div>
                    </div>
                    <p>{this.props.chatMessage.contents}</p>
                </div>
            </li>

        );
    }
});

module.exports = ChatMessage;
