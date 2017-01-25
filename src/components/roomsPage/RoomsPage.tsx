import * as React from 'react';

import NavBar from '../navBar/NavBar';

declare function require(path: string): any;

var PageConnector : any;
if (typeof window !== 'undefined') {
    PageConnector = require('../../client/connectors/PageConnector');
} else {
    PageConnector = function () {
    };
}

var IndexPage = React.createClass({

    render: function () {
        return (
            <div className="topLevelContent">
                <NavBar connector={this.connector}
                        initialUser={this.props.initialUser}
                        title={this.props.title}/>
                <div className="container">
                    TODO room page choice here
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    }

});

export default IndexPage;
