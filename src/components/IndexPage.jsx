var React = require('react');

var IndexPage = React.createClass({

    render: function () {
        return (
            <div>
                <ul>
                    <li><a href="/login">Log In</a></li>
                    <li><a href="/signup">Sign Up</a></li>
                    <li><a href="/r/robbiesroom">Robbie's Room</a></li>
                </ul>
            </div>
        );
    }

});

module.exports = IndexPage;
