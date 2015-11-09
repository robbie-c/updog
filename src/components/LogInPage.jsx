var React = require('react');

var NavBar = require('./NavBar.jsx');

var LoginPage = React.createClass({
    render: function () {

        return (
            <div className="topLevelContent">
                <NavBar user={this.props.user} title={this.props.title}/>
                <div className="container">
                    <form action="/login" method="post">
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" className="form-control"
                                   name="email"/>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" className="form-control"
                                   name="password"/>
                        </div>

                        <button type="submit" className="btn btn-warning btn-lg">
                            Login
                        </button>
                    </form>

                    <a href="/auth/google" className="btn btn-danger"><span className="fa fa-google-plus"/>
                        Google</a>

                    <hr/>

                    <p>Need an account? <a href="/signup">Signup</a></p>

                    <p>Or go <a href="/">home</a>.</p>
                </div>
            </div>
        );
    }
});

module.exports = LoginPage;
