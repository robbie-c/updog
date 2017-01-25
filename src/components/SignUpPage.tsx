import * as React from 'react';

import NavBar from './navBar/NavBar';

import PageConnector from '../client/connectors/PageConnector.js';

var SignUpPage = React.createClass({

    render: function () {

        return (
            <div className="topLevelContent">
                <NavBar initialUser={this.props.initialUser} title={this.props.title} connector={this.connector}/>
                <div className="container">
                    <form action="/signup" method="post">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" className="form-control" name="email"/>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" className="form-control" name="password"/>
                        </div>

                        <button type="submit" className="btn btn-warning btn-lg">
                            Signup
                        </button>
                    </form>

                    <div>Or sign up with:</div>

                    <a href="/auth/google" className="btn btn-danger"><span className="fa fa-google-plus"/> Google</a>

                    <hr/>

                    <p>Already have an account? <a href="/login">Login</a></p>

                    <p>Or go <a href="/">home</a>.</p>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        if (typeof window !== 'undefined') {
            this.connector = new PageConnector({}, []);
        }
    }
});

export default SignUpPage;
