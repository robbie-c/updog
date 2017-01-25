var helpers = require('./helpers');
var doApiCall = helpers.doApiCall;
var doApiCallUnwrapped = helpers.doApiCallUnwrapped;

function apiCompleteProfile(profileData, callback) {
    return doApiCall('/api/user/completeProfile', profileData, callback);
}

function loginWithToken(username, password, callback) {
    var data = JSON.stringify({
        email: username,
        password: password
    });

    return doApiCallUnwrapped('/loginWithToken', data, callback);
}

export default {
    apiCompleteProfile: apiCompleteProfile,
    loginWithToken: loginWithToken
};
