var React = require('react');

var LoginPage = React.createClass({
    render: function () {

        return (
            <div>
                <form action="/login" method="post">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" name="email"/>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" name="password"/>
                    </div>

                    <button type="submit" className="btn btn-warning btn-lg">Login</button>
                </form>

                <hr/>

                <p>Need an account? <a href="/signup">Signup</a></p>

                <p>Or go <a href="/">home</a>.</p>
            </div>
        );
    }
});

module.exports = LoginPage;