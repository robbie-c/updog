var React = require('react');
var update = require('react-addons-update');

var ChatMessage = require('./ChatMessage.jsx');
var ChatComposer = require('./ChatComposer.jsx');

var logger = require('../../common/logger');
var events = require('../../common/constants/events');

var TextChatArea = React.createClass({

    getInitialState: function () {
        return {
            roomData: {},
            selfUser: null,
            chatMessages: this.props.initialChatMessages || [],
            room: this.props.initialRoom
        }
    },

    render: function () {
        var _this = this;

        var selfUserId = this.state.selfUser ? this.state.selfUser._id.toString() : null;

        return (
            <div>
                <ul className="chatMessageList">
                {
                    this.state.chatMessages.map(function (chatMessage) {
                        var posterUser;
                        var key;
                        if (chatMessage.localMessageId) {
                            posterUser = _this.state.selfUser;
                            key = chatMessage.localMessageId;
                        } else {
                            posterUser = _this.state.roomData.users[chatMessage.fromUserId];
                            key = 'remote-' + chatMessage._id;
                        }

                        return <ChatMessage key={key} chatMessage={chatMessage} posterUser={posterUser} selfUserId={selfUserId} mySocketId={_this.props.connector.mySocketId}/>
                    })
                }
                </ul>
                <ChatComposer connector={this.props.connector}
                              initialUser={this.props.initialUser}
                              title={this.props.title}
                              initialRoom={this.props.initialRoom}/>
            </div>
        );
    },

    componentDidMount: function() {
        this.props.connector.on(events.TEXT_CHAT_MESSAGE, this.onTextChatMessage);
        this.props.connector.on(events.OPTIMISTIC_CHAT_MESSAGE, this.onOptimisticChatMessage);
        this.props.connector.on(events.ROOM_DATA_CHANGED, this.onRoomDataChanged);
        this.props.connector.on(events.SELF_USER, this.onSelfUserChanged);
    },

    onTextChatMessage: function(message) {
        var newState = update(this.state, {
            chatMessages: {
                $push: [message]
            }
        });

        this.setState(newState);
    },

    onOptimisticChatMessage: function(message) {
        var newState = update(this.state, {
            chatMessages: {
                $push: [message]
            }
        });

        this.setState(newState);
    },

    onRoomDataChanged: function(roomData) {
        this.setState({
            roomData: roomData
        })
    },

    onSelfUserChanged: function(selfUser) {
        this.setState({
            selfUser: selfUser
        });
    }
});

module.exports = TextChatArea;
