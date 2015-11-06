var React = require('react');

var VideoArea = require('./CallArea.jsx');
var NavBar = require('./NavBar.jsx');
var RoomControl = require('./RoomControl.jsx');

var PermanentCallPage = React.createClass({
    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar user={this.props.user} title={this.props.title} room={this.props.room}/>
                <h1>Hi there!</h1>
                <VideoArea user={this.props.user} title={this.props.title} room={this.props.room}/>
                <RoomControl user={this.props.user} title={this.props.title} room={this.props.room}/>
            </div>
        );
    }
});

module.exports = PermanentCallPage;
