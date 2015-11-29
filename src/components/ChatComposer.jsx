var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;

var events = require('../common/constants/events');

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
            type: 'plaintext'
        };

        this.props.connector.sendTextChatMessage(message);
    },

    render: function () {
        return (
            <form onSubmit={this.onFormSubmit}>
                <Input type="textarea" onChange={this.onTextAreaChange} value={this.state.value}/>
                <ButtonInput type="submit" value="Submit Button" />
            </form>
        );
    }
});

module.exports = ChatMessage;
