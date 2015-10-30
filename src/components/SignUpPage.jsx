var React = require('react');

var SignUpPage = React.createClass({

    render: function () {

        return (
            <div>
                <form action="/signup" method="post">
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
                        Signup
                    </button>
                </form>

                <a href="/auth/google" className="btn btn-danger"><span
                    className="fa fa-google-plus"></span> Google</a>

                <hr/>

                <p>Already have an account? <a href="/login">Login</a></p>

                <p>Or go <a href="/">home</a>.</p>
            </div>
        );
    }
});

module.exports = SignUpPage;
