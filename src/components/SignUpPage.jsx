var React = require('react');

var NavBar = require('./navBar/NavBar.jsx');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../client/connectors/PageConnector');
} else {
    PageConnector = function () {
    };
}

var SignUpPage = React.createClass({

    render: function () {

        return (
            <div className="topLevelContent">
                <NavBar initialUser={this.props.initialUser} title={this.props.title}/>
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
        this.connector = new PageConnector();
    }
});

module.exports = SignUpPage;
