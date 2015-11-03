var React = require('react');

var $ = require('jquery');

var apiUsers = require('../../client/api/user');
var errors = require('../../common/errors');
var validationUser = require('../../common/validation/user');

var CompleteProfileForm = React.createClass({

    getInitialState: function () {
        return {
            displayName: '',
            displayNameFeedback: ''
        }
    },

    render: function () {
        return (
            <form action='POST' onSubmit={this.handleSubmit}>
                <label>Choose Display Name</label>
                <input type='text' id='displayName'
                       value={this.state.displayName}
                       onChange={this.handleChange.bind(this, 'displayName')}/>
                <input type='submit' value='Submit'/>
                <span
                    id="displayNameFeedback">{this.state.displayNameFeedback}</span>
            </form>
        );
    },

    handleSubmit: function (e) {
        e.preventDefault();

        var self = this;

        var newDisplayName = this.state.displayName;

        Promise.resolve()
            .then(function () {
                validationUser.validateNewDisplayName(newDisplayName)
            })
            .then(function () {
                return apiUsers.apiCompleteProfile({
                    displayName: newDisplayName
                });
            })
            .then(function () {
                self.setState({
                    displayNameFeedback: 'succeeded'
                });
            })
            .catch(function (err) {
                logger.info('got err', err.constructor.name, err);
                if (err instanceof errors.ValidationError) {
                    switch (err.what) {
                        case 'displayName':
                            self.setState({
                                displayNameFeedback: err.i18nMessage()
                            });
                            break;
                        default:
                            throw err;
                    }
                } else {
                    throw err;
                }
            })
    },

    handleChange(field, event) {
        var nextState = {};
        nextState[field] = event.target.value;
        this.setState(nextState)
    }
});

module.exports = CompleteProfileForm;
