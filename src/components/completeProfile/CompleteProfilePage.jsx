var React = require('react');

var CompleteProfileForm = require('./CompleteProfileForm.jsx');

var CompleteProfilePage = React.createClass({

    render: function () {
        return (
            <div>
                <h1>Please complete your profile!</h1>
                <CompleteProfileForm/>
            </div>
        );
    }
});

module.exports = CompleteProfilePage;
