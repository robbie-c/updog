var React = require('react');

var ProfilePage = React.createClass({

    render: function () {
        return (
            <div>
                <div>The thingy</div>
                {JSON.stringify(this.props.user)}
            </div>
        );
    }

});

module.exports = ProfilePage;