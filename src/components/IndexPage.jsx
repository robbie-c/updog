var React = require('react');

var NavBar = require('./navBar/NavBar.jsx');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../client/connectors/PageConnector');
} else {
    PageConnector = function () {
    };
}

var IndexPage = React.createClass({

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <div className="container">
                    <ul>
                        <li><a href="/login">Log In</a></li>
                        <li><a href="/signup">Sign Up</a></li>
                        <li><a href="/r/robbiesroom">Robbie's Room</a></li>
                    </ul>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        console.log('component will mount');
        this.connector = new PageConnector();
    }

});

module.exports = IndexPage;
