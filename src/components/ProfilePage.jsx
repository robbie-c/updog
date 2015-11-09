var React = require('react');

var NavBar = require('./NavBar.jsx');

var ProfilePage = React.createClass({

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar user={this.props.user} title={this.props.title}/>
                <div className="container">
                    <div>The thingy</div>
                    {JSON.stringify(this.props.user)}
                </div>
            </div>
        );
    }

});

module.exports = ProfilePage;
