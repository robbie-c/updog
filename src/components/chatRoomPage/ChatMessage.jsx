var React = require('react');

var Linkify = require('react-linkify');

var logger = require('../../common/logger');

var ChatMessage = React.createClass({

    render: function () {
        var chatMessage = this.props.chatMessage;
        var posterUser = this.props.posterUser;
        var selfUserId = this.props.selfUserId;
        var mySocketId = this.props.mySocketId;

        var isSelf = (typeof chatMessage.localMessageId !== 'undefined') ||
            (mySocketId != null && mySocketId == chatMessage.fromClientId) ||
            (selfUserId != null && selfUserId == chatMessage.fromUserId);

        var displayName = posterUser ? posterUser.displayName : 'anon-' + chatMessage.fromClientId;
        var dateRaw = chatMessage.serverTime ? chatMessage.serverTime : chatMessage.clientTime;
        var dateObj = new Date(dateRaw);
        var dateStr = dateObj.toISOString(); // TODO probably should format this a bit better

        var chatMessageClass = "chatMessage clearfix " + isSelf ? "right" : "left";
        var imageSpanClass = isSelf ? "pull-right" : "pull-left";
        var contentsClass = 'chatMessage__contents ' + (isSelf ? 'chatMessage__contents--self' : 'chatMessage__contents--other');

        return (
            <li className={chatMessageClass}>
                <span className={imageSpanClass}>
                    <img src="https://placehold.it/50/55C1E7/fff&text=U" className="img-circle" height="30px"
                         width="30px"/>
                </span>
                <div className={contentsClass}>
                    <div>
                        <div className="header">
                            <strong>{displayName}</strong>
                            <small className="pull-right">{dateStr}</small>
                        </div>
                    </div>
                    <Linkify properties={{rel: 'nofollow'}}>{this.props.chatMessage.contents}</Linkify>
                </div>
            </li>

        );
    }
});

module.exports = ChatMessage;
