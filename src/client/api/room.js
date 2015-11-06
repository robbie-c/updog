
var helpers = require('./helpers');
var doApiCall = helpers.doApiCall;

function apiClaimRoom(roomName, callback) {
    return doApiCall('/api/room/claimRoom', roomName, callback);
}

module.exports = {
    apiClaimRoom: apiClaimRoom
};
