var React = require('react');

var NavBar = require('../navBar/NavBar.jsx');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../../client/connectors/PageConnector');
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
                    TODO room page choice here
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    }

});

module.exports = IndexPage;
