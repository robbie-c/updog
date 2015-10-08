var React = require('react');

var VideoArea = require('./CallArea.jsx');

var PermanentCallPage = React.createClass({
    render: function() {
        return (
            <div className="topLevelContent">
                <h1>Hi there!</h1>
                <VideoArea/>
            </div>
        );
    }
});

module.exports = PermanentCallPage;
