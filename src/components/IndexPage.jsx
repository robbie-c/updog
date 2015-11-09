var React = require('react');

var NavBar = require('./NavBar.jsx');

var IndexPage = React.createClass({

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar user={this.props.user} title={this.props.title}/>
                <div className="container">
                    <ul>
                        <li><a href="/login">Log In</a></li>
                        <li><a href="/signup">Sign Up</a></li>
                        <li><a href="/r/robbiesroom">Robbie's Room</a></li>
                    </ul>
                </div>
            </div>
        );
    }

});

module.exports = IndexPage;
