var React = require('react');

var NavBar = require('./NavBar.jsx');

var logger = require('../common/logger');

var apiRoom = require('../client/api/room');

var RoomControl = React.createClass({

    getInitialState: function () {
        var room = this.props.room;
        return {
            user: this.props.initialUser,
            isAwaitingClaimRoom: false,
            settingsVideo: room.settings.video,
            isAwaitingSettingsVideo: false
        }
    },

    render: function () {
        var user = this.state.user;
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
                    {this.state.isAwaitingSettingsVideo ? (
                    <div className="form-group">
                        <span className="fa fa-spinner fa-pulse"/>Video
                    </div>
                        ) : (
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" checked={this.state.settingsVideo}
                                   onChange={this.handleChange.bind(this, 'settingsVideo')}/>Video
                        </label>
                    </div>
                        )}
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
                this.setState({isAwaitingSettingsVideo: true});
                apiRoom.updateSetting(this.props.room._id, 'video', event.target.checked, function(err, newSettings) {
                    this.setState({isAwaitingSettingsVideo: false});

                    if (newSettings.video !== undefined) {
                        this.setState({settingsVideo: newSettings.video});
                    }
                }.bind(this));
                break;
        }
    }
});

module.exports = RoomControl;
