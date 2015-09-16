var React = require('react');

var VideoArea = require('./CallArea');

function onClickHandler() {
    console.log("yellow");
}

var PermanentCallPage = React.createClass({
    render: function() {
        return (
            <div className="topLevelContent">
                <h1>Hi there!</h1>
                <VideoArea/>
                <button type="button" onClick={onClickHandler}>hello</button>
            </div>
        );
    }
});

module.exports = PermanentCallPage;
