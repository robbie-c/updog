var React = require('react');

var VideoArea = require('./CallArea.jsx');
var NavBar = require('./navBar/NavBar.jsx');
var RoomControl = require('./RoomControl.jsx');

var RoomConnector;
if (typeof window !== 'undefined') {
    RoomConnector = require('../client/connectors/RoomConnector');
} else {
    RoomConnector = function () {
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
                            <VideoArea connector={this.connector}
                                       initialUser={this.props.initialUser}
                                       title={this.props.title}
                                       room={this.props.room}/>
                        </div>
                        <div className="col-md-4">
                            <RoomControl connector={this.connector}
                                         initialUser={this.props.initialUser}
                                         title={this.props.title}
                                         room={this.props.room}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new RoomConnector();
    }
});

module.exports = PermanentCallPage;
