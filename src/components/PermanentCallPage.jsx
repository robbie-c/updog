var React = require('react');

var VideoArea = require('./CallArea.jsx');
var NavBar = require('./NavBar.jsx');
var RoomControl = require('./RoomControl.jsx');

var PermanentCallPage = React.createClass({
    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar user={this.props.user} title={this.props.title} room={this.props.room}/>
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
    }
});

module.exports = PermanentCallPage;
