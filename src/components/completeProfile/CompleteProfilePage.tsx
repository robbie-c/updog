import * as React from 'react';

import CompleteProfileForm from './CompleteProfileForm';

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

export default CompleteProfilePage;
