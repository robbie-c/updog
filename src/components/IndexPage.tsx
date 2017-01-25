import * as React from 'react';

import NavBar from './navBar/NavBar';

import PageConnector from '../client/connectors/PageConnector.js';

var IndexPage = React.createClass({

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <div className="container">
                    <ul>
                        <li><a href="/login">Log In</a></li>
                        <li><a href="/signup">Sign Up</a></li>
                        <li><a href="/r/robbiesroom">Robbie's Room</a></li>
                    </ul>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        console.log('component will mount');
        if (typeof window !== 'undefined') {
            this.connector = new PageConnector({}, []);
        }
    }

});

export default IndexPage;
