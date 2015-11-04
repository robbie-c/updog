var React = require('react');

var logger = require('../common/logger');

var NavBar = React.createClass({

    render: function () {

        var userButton = null;
        if (this.props.user && this.props.user.displayName) {
            userButton = (
                <li>
                    <a href="/profile">{this.props.user.displayName}</a>
                </li>
            )
        } else if (this.props.user) {
            // partially completed user
            userButton = (
                <li>
                    <a href="/completeprofile">Complete Your Profile</a>
                </li>
            )
        }

        var logInButton;
        if (this.props.user) {
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

        logger.log('user', this.props.user);

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
    }
});

module.exports = NavBar;
