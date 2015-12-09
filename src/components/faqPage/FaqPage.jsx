var React = require('react');

var NavBar = require('../navBar/NavBar.jsx');

var PageConnector;
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
                    <h1>What is UpDog</h1>
                    <p>It is a audio, video and text chat room service, designed by gamers for gamers.</p>

                    <h1>How do I use it?</h1>
                    <p>To create a room, go to the <a href="/r/">rooms page</a> and enter the desired name. Alternatively just go to https://updog.gg/r/<strong>room-name-here</strong></p>

                    <h1>Who made this?</h1>
                    <p>It was made as a hobby project by <a href="https://github.com/robbie-c/">robbie-c</a> who got a bit carried away.</p>
                </div>
            </div>
        );
    },

    componentWillMount: function () {
        this.connector = new PageConnector();
    }

});

module.exports = IndexPage;
