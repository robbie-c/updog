import * as React from 'react';
var ReactBootstrap = require('react-bootstrap');
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;

var logger = require('../../common/logger');
var events = require('../../common/constants/events');

var localMessageCount = 0;

var ChatMessage = React.createClass({

    getInitialState: function() {
        return {
            value: ''
        }
    },

    onTextAreaChange: function (e) {
        this.setState({
            value: e.target.value
        })
    },

    onFormSubmit: function (e) {
        e.preventDefault();

        // only include what is absolutely necessary, the server will fill in user and room info
        // TODO maybe we should include it anyway then the server can make sure it matches?
        var message = {
            contents: this.state.value,
            clientTime: Date.now(),
            type: 'plaintext',
            localMessageId: 'local-' + localMessageCount++
        };

        this.setState({
            value: ''
        });

        this.props.connector.sendTextChatMessage(message);
    },

    onKeyPress: function (e) {
        if (e.key === 'Enter' && !e.getModifierState('Shift')) {
            this.onFormSubmit(e);
        }
    },

    render: function () {
        return (
            <form onSubmit={this.onFormSubmit}>
                <Input type="textarea" onChange={this.onTextAreaChange} onKeyPress={this.onKeyPress} value={this.state.value}/>
                <ButtonInput type="submit" value="Submit Button" />
            </form>
        );
    }
});

export default ChatMessage;
