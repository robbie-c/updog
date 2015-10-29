var $ = require('jquery');

var helpers = require('./helpers');
var doApiCall = helpers.doApiCall;

function apiCompleteProfile(profileData, callback) {
    return doApiCall('/api/user/completeProfile', profileData, callback);
}

module.exports = {
    apiCompleteProfile: apiCompleteProfile
};
