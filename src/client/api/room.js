
var helpers = require('./helpers');
var doApiCall = helpers.doApiCall;

function apiClaimRoom(roomName, callback) {
    return doApiCall('/api/room/claimRoom', roomName, callback);
}

function updateSetting(roomName, key, val, callback) {
    return doApiCall('/api/room/updateSetting', {
        roomName: roomName,
        key: key,
        val: val
    }, callback);
}

module.exports = {
    apiClaimRoom: apiClaimRoom,
    updateSetting: updateSetting
};
