var React = require('react');
var _ = require('underscore');

var logger = require('../../common/logger');
var events = require('../../common/constants/events');


var RemoteVideo = require('./RemoteVideo.jsx');

var PeopleArea = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser,
            room: this.props.initialRoom,
            roomData: {},
            streams: {},
            peerState: {}
        }
    },

    render: function () {
        var self = this;

        logger.log(this.state.peerState);
        logger.log(this.state.roomData);

        return (
            <div>
                <div className="row">
                    <div className="col-md-4">Self</div>
                    <div className="col-md-2">TODO Mute</div>
                    <div className="col-md-2">TODO Levels</div>
                    <div className="col-md-4">TODO Slider</div>
                </div>
                <div className="row">
                    <div className="col-md-4">All</div>
                    <div className="col-md-2">TODO Mute</div>
                </div>
                <hr/>
                {
                    Object.keys(this.state.peerState).map(function (participantId) {

                        var displayName;

                        if (self.state.roomData.participants) {
                            var participant = self.state.roomData.participants[participantId];
                            if (participant && participant.user && participant.user.displayName) {
                                displayName = participant.user.displayName;
                            }
                        }

                        if (!displayName) {
                            displayName = 'anon-' + participantId;
                        }

                        return (<div className="row" key={'peerState-' + participantId}>
                            <div className="col-md-4">{displayName}</div>
                            <div className="col-md-2">TODO Mute</div>
                            <div className="col-md-2">TODO Levels</div>
                            <div className="col-md-4">TODO Slider</div>
                        </div>);
                    })
                }
            </div>
        );
    },

    componentDidMount: function () {
        var _this = this;
        var connector = this.props.connector;

        connector.on(events.DID_JOIN_ROOM, function (roomData) {
            _this.setState({roomData: roomData});
        });

        connector.on(events.ROOM_DATA_CHANGED, function (roomData) {
            _this.setState({roomData: roomData});
        });

        connector.on(events.PEER_STATE_CHANGED, function (state) {
            _this.setState({peerState: state});
        });

        connector.on(events.SELF_USER, function (user) {
            _this.setState({user: user});
        });

    }
});

module.exports = PeopleArea;
