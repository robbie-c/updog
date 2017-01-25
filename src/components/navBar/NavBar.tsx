import * as React from "react";
import * as  ReactBootstrap from "react-bootstrap";
import * as async from "async";
import logger from "../../common/logger";
import apiUser from "../../client/api/user.js";
const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;

interface INavBarProps {
    initialUser: any,
    initialRoom?: any
    connector: any,
    title: string
}

interface INavBarState {
    user: any,
    showLoginModal: boolean,
    loginFormEmail: string,
    loginFormPassword: string,
    loginInProgress: boolean
}

export class NavBar extends React.Component<INavBarProps, INavBarState> {

    refs: {
        [key: string]: Element;
        loginFormEmail: HTMLInputElement;
        loginFormPassword: HTMLInputElement
    } = null;

    constructor(props: INavBarProps) {
        super(props);
        this.state = {
            user: this.props.initialUser,
            showLoginModal: false,
            loginFormEmail: '',
            loginFormPassword: '',
            loginInProgress: false
        };
    }

    showLoginModal() {
        this.state = {
            ...this.state,
            showLoginModal: true
        };
    }

    hideLoginModal() {
        this.state = {
            ...this.state,
            showLoginModal: false
        };
    }

    loginOnClick(e: React.FormEvent<HTMLElement>) {
        e.preventDefault();

        this.showLoginModal();
    }

    onLocalLoginSubmit(e: React.FormEvent<HTMLElement>) {
        e.preventDefault();

        // use refs rather than state, because of https://github.com/facebook/react/issues/1159
        const email = this.refs.loginFormEmail.value;
        const password = this.refs.loginFormPassword.value;

        async.waterfall([
            function (callback: (token: string) => void) {
                apiUser.loginWithToken(email, password, callback);
            },
            function (token: string, callback: () => void) {
                this.props.connector.useToken(token, callback);
            }.bind(this)
        ], function (err: Error) {
            this.setState({loginInProgress: false});
            if (err) {
                // TODO handle error
                logger.log(err);
            } else {
                this.hideLoginModal();
            }
        }.bind(this));
    }

    onInputChanged(what: string, event: React.FormEvent<HTMLElement>) {
        const element: HTMLInputElement = event.target as HTMLInputElement;
        switch (what) {
            case 'loginFormEmail':
                this.state = {
                    ...this.state,
                    loginFormEmail: element.value
                };
                break;
            case 'loginFormPassword':
                this.state = {
                    ...this.state,
                    loginFormPassword: element.value
                };
                break;
        }
    }

    render() {

        let userButton = null;
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

        let logInButton;
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
                                <a className="navbar-brand" href="/"><strong>Updog</strong>
                                    <small>Unreleased Alpha</small>
                                </a>
                            </div>
                            <ul className="nav navbar-nav">
                                <li>
                                    <a href="/r/">
                                        Rooms
                                    </a>
                                </li>
                                <li>
                                    <a href="/faq">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
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
                                       required/>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password"
                                       className="form-control"
                                       name="password"
                                       value={this.state.loginFormPassword}
                                       onChange={this.onInputChanged.bind(this, 'loginFormPassword')}
                                       ref="loginFormPassword"
                                       required/>
                            </div>

                            <Button type="submit"
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
    }

    componentDidMount() {
        this.props.connector.on('self user', function (user: any) {
            this.setState({user: user});
        }.bind(this));
    }
}

export default NavBar;
