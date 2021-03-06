import * as React from 'react';

import NavBar from './../navBar/NavBar';

var logger = require('../../common/logger');
var events = require('../../common/constants/events');

var apiRoom = require('../../client/api/room');

var RoomControl = React.createClass({

    getInitialState: function () {
        return {
            room: this.props.initialRoom,
            user: this.props.initialUser,
            isAwaitingClaimRoom: false,
            isAwaitingSettingsVideo: false
        }
    },

    render: function () {
        var user = this.state.user;
        var room = this.state.room;

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
        if (user && room && room.owner && (room.owner._id === user._id)) {
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
                            <input type="checkbox" checked={this.state.room.settings.video}
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
        apiRoom.apiClaimRoom(this.state.room._id, function (err, data) {
            this.setState({isAwaitingClaimRoom: false});
            if (err) {
                logger.error(err);
            } else {
                this.setState({room: data.room});
            }
        }.bind(this));
    },

    handleChange: function (what, event) {
        switch (what) {
            case 'settingsVideo':
                this.setState({isAwaitingSettingsVideo: true});
                apiRoom.updateSetting(this.state.room._id, 'video', event.target.checked, function (err, data) {
                    var newState = {
                        isAwaitingSettingsVideo: false
                    };
                    if (err) {
                        logger.error(err);
                    } else {
                        newState.room = data.room;
                    }
                    this.setState(newState);
                }.bind(this));
                break;
        }
    },

    onRoomDataChanged: function (roomData) {
        this.setState({
            room: roomData.room
        })
    },

    componentDidMount: function() {
        var connector = this.props.connector;
        connector.on(events.DID_JOIN_ROOM, this.onRoomDataChanged);
        connector.on(events.ROOM_DATA_CHANGED, this.onRoomDataChanged);
    }
});

export default RoomControl;
