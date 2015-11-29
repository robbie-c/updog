var React = require('react');
var update = require('react-addons-update');

var ChatMessage = require('./ChatMessage.jsx');
var ChatComposer = require('./ChatComposer.jsx');

var logger = require('../common/logger');
var events = require('../common/constants/events');

var TextChatArea = React.createClass({

    getInitialState: function () {
        return {
            chatMessages: this.props.initialChatMessages || []
        }
    },

    render: function () {
        return (
            <div className="topLevelContent">
                {
                    this.state.chatMessages.map(function (chatMessage) {
                        return <ChatMessage key={chatMessage.id} chatMessage={chatMessage}/>
                    })
                }
                <ChatComposer connector={this.props.connector}
                              initialUser={this.props.initialUser}
                              title={this.props.title}
                              room={this.props.room}/>
            </div>
        );
    },

    componentDidMount: function() {
        this.props.connector.on(events.TEXT_CHAT_MESSAGE, this.onTextChatMessage.bind(this));
        this.props.connector.on(events.OPTIMISTIC_CHAT_MESSAGE, this.onOptimisticChatMessage.bind(this));
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
    }

});

module.exports = TextChatArea;
