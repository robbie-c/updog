import * as React from 'react';

import NavBar from './navBar/NavBar';

import PageConnector from '../client/connectors/PageConnector.js';

var ProfilePage = React.createClass({

    getInitialState: function () {
        return {
            user: this.props.initialUser
        }
    },

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.props.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <div className="container">
                    <div>The thingy</div>
                    {JSON.stringify(this.state.user)}
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        if (typeof window !== 'undefined') {
            this.connector = new PageConnector({}, []);
        }
    }

});

export default ProfilePage;
