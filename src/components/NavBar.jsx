var React = require('react');

var logger = require('../common/logger');

var NavBar = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser
        }
    },

    render: function () {

        logger.log('navbar render');

        var userButton = null;
        if (this.state.user && this.state.user.displayName) {
            userButton = (
                <li>
                    <a href="/profile">{this.state.user.displayName}</a>
                </li>
            )
        } else if (this.state.user) {
            // partially completed user
            userButton = (
                <li>
                    <a href="/completeprofile">Complete Your Profile</a>
                </li>
            )
        }

        var logInButton;
        if (this.state.user) {
            logInButton = (
                <li>
                    <a href="/logout">Log Out</a>
                </li>
            )
        } else {
            logInButton = (
                <li>
                    <a href="/login">Log In</a>
                </li>
            )
        }

        logger.log('user', this.state.user);

        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">Updog</a></div>
                    <ul className="nav navbar-nav navbar-right">
                        {userButton}
                        {logInButton}
                    </ul>
                </div>
            </nav>
        );
    },

    componentDidMount: function () {
        console.log('navbar mounted');
        if (this.props.connector) {
            console.log('listening for self user');
            this.props.connector.on('self user', function (user) {
                console.log('setting state here');
                this.setState({user: user});
            }.bind(this));

        } else {
            console.log('no connector');
        }
    }
});

module.exports = NavBar;
