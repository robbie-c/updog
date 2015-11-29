var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var ButtonInput = ReactBootstrap.ButtonInput;
var async = require('async');

var logger = require('../../common/logger');
var apiUser = require('../../client/api/user');

var NavBar = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser,
            showLoginModal: false,
            loginFormEmail: '',
            loginFormPassword: '',
            loginInProgress: false
        }
    },

    showLoginModal: function () {
        this.setState({showLoginModal: true});
    },

    hideLoginModal: function () {
        this.setState({showLoginModal: false});
    },

    loginOnClick: function (e) {
        e.preventDefault();

        this.showLoginModal();
    },

    onLocalLoginSubmit: function (e) {
        e.preventDefault();

        // use refs rather than state, because of https://github.com/facebook/react/issues/1159
        var email = this.refs.loginFormEmail.value;
        var password = this.refs.loginFormPassword.value;

        async.waterfall([
            function (callback) {
                apiUser.loginWithToken(email, password, callback);
            },
            function (token, callback) {
                this.props.connector.useToken(token, callback);
            }.bind(this)
        ], function (err) {
            this.setState({loginInProgress: false});
            if (err) {
                // TODO handle error
                logger.log(err);
            } else {
                this.hideLoginModal();
            }
        }.bind(this));
    },

    onInputChanged: function (what, e) {
        switch (what) {
            case 'loginFormEmail':
                this.setState({
                    loginFormEmail: e.target.value
                });
                break;
            case 'loginFormPassword':
                this.setState({
                    loginFormPassword: e.target.value
                });
                break;
        }
    },

    render: function () {

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
                    <a href="/login" onClick={this.loginOnClick}>Log In</a>
                </li>
            )
        }

        return (
            <div>
                <div>
                    <nav className="navbar navbar-default navbar-fixed-top">
                        <div className="container">
                            <div className="navbar-header">
                                <a className="navbar-brand" href="/">Updog</a>
                            </div>
                            <ul className="nav navbar-nav navbar-right">
                                {userButton}
                                {logInButton}
                            </ul>
                        </div>
                    </nav>
                </div>

                <Modal show={this.state.showLoginModal} onHide={this.hideLoginModal}>
                    <Modal.Header>
                        <Modal.Title>Log In</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <form action="/login" method="post" onSubmit={this.onLocalLoginSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email"
                                       className="form-control"
                                       name="email"
                                       value={this.state.loginFormEmail}
                                       onChange={this.onInputChanged.bind(this, 'loginFormEmail')}
                                       ref="loginFormEmail"
                                       required={true}/>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password"
                                       className="form-control"
                                       name="password"
                                       value={this.state.loginFormPassword}
                                       onChange={this.onInputChanged.bind(this, 'loginFormPassword')}
                                       ref="loginFormPassword"
                                       required={true}/>
                            </div>

                            <ButtonInput type="submit"
                                         bsStyle="warning"
                                         bsSize="large"
                                         value="Login"
                                         disabled={this.state.loginInProgress}/>
                        </form>

                        <div>Or log in with:</div>

                        <a href="/auth/google" className="btn btn-danger">
                            <span className="fa fa-google-plus"/>Google
                        </a>

                        <hr/>

                        <p>Need an account? <a href="/signup">Signup</a></p>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.hideLoginModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    },

    componentDidMount: function () {
        this.props.connector.on('self user', function (user) {
            this.setState({user: user});
        }.bind(this));
    }
});

module.exports = NavBar;
