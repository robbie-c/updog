import * as React from 'react';

declare function require(path: string): any;

var VideoArea = require('./CallArea.jsx');
import NavBar from '../navBar/NavBar';
var RoomControl = require('./RoomControl.jsx');
var TextChatArea = require('./TextChatArea.jsx');
var PeopleArea = require('./PeopleArea.jsx');

import RoomConnector from '../../client/connectors/RoomConnector.js';

var PermanentCallPage = React.createClass({
    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}
                        initialRoom={this.props.initialRoom}
                />
                <div>
                    <div className="col-md-3">
                        <PeopleArea connector={this.connector}
                                     initialUser={this.props.initialUser}
                                     title={this.props.title}
                                     initialRoom={this.props.initialRoom}
                        />
                    </div>
                    <div className="col-md-6">
                        <VideoArea connector={this.connector}
                                   initialUser={this.props.initialUser}
                                   title={this.props.title}
                                   initialRoom={this.props.initialRoom}
                        />
                        <TextChatArea
                            connector={this.connector}
                            initialUser={this.props.initialUser}
                            title={this.props.title}
                            initialRoom={this.props.initialRoom}
                            initialChatMessages={this.props.initialChatMessages}
                        />
                    </div>
                    <div className="col-md-3">
                        <RoomControl connector={this.connector}
                                     initialUser={this.props.initialUser}
                                     title={this.props.title}
                                     initialRoom={this.props.initialRoom}
                        />
                    </div>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new RoomConnector({}, []);
    }
});

export default PermanentCallPage;
