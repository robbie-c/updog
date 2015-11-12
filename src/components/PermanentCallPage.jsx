var React = require('react');

var VideoArea = require('./CallArea.jsx');
var NavBar = require('./NavBar.jsx');
var RoomControl = require('./RoomControl.jsx');

var PageConnector;
if (typeof window !== 'undefined') {
    PageConnector = require('../client/connectors/RoomConnector');
} else {
    PageConnector = function () {
    };
}

var PermanentCallPage = React.createClass({
    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}
                        room={this.props.room}/>
                <div className="container">
                    <h1>Hi there!</h1>
                    <div className=" row">
                        <div className="col-md-8">
                            <VideoArea user={this.props.user} title={this.props.title} room={this.props.room}/>
                        </div>
                        <div className="col-md-4">
                            <RoomControl user={this.props.user} title={this.props.title} room={this.props.room}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    }
});

module.exports = PermanentCallPage;
