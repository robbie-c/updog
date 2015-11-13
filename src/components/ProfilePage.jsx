var React = require('react');

var NavBar = require('./NavBar.jsx');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../client/connectors/PageConnector');
} else {
    PageConnector = function () {
    };
}

var ProfilePage = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser
        }
    },

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.props.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <div className="container">
                    <div>The thingy</div>
                    {JSON.stringify(this.state.user)}
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    }

});

module.exports = ProfilePage;
