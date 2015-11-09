var React = require('react');

var NavBar = require('./NavBar.jsx');

var logger = require('../common/logger');

var apiRoom = require('../client/api/room');

var RoomControl = React.createClass({

    getInitialState: function () {
        var room = this.props.room;
        return {
            isAwaitingClaimRoom: false,
            settingsVideo: room.settings.video
        }
    },

    render: function () {
        var user = this.props.user;
        var room = this.props.room;

        logger.log(user, room);

        var claimThisRoom = null;
        if (user && room && !room.owner) {
            claimThisRoom = (
                <form onSubmit={this.handleSubmit}>
                    <button type="submit" disabled={this.state.isAwaitingClaimRoom ? 'disabled' : ''}>Claim this room
                    </button>
                </form>
            )
        } else if (room && room.owner) {
            claimThisRoom = (
                <p>Room owned by {room.owner.displayName}</p>
            )
        } else if (!user && room && !room.owner) {
            claimThisRoom = (
                <p>Log in to claim this room</p>
            )
        }

        var ownerControls = null;
        if (user && room && (room.owner._id === user._id)) {
            ownerControls = (
                <div>
                    <span>Owner controls</span>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" checked={this.state.settingsVideo} onChange={this.handleChange.bind(this, 'settingsVideo')}/>Video
                        </label>
                    </div>
                </div>
            )
        }

        return (
            <div className="roomControl">
                {claimThisRoom}
                {ownerControls}
            </div>
        );
    },

    handleSubmit: function (e) {
        e.preventDefault();
        this.setState({isAwaitingClaimRoom: true});
        apiRoom.apiClaimRoom(this.props.room._id, function (err, data) {
            this.setState({isAwaitingClaimRoom: false});
            if (err) {
                logger.error(err);
            } else {
                this.setProps({room: data.room});
            }
        }.bind(this));
    },

    handleChange: function (what, event) {
        switch (what) {
            case 'settingsVideo':
                this.setState({settingsVideo: event.target.checked});
                break;
        }
    }
});

module.exports = RoomControl;
