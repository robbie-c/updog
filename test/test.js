var url = require('../src/client/url');

var expect = require('expect.js');

describe('ChatManager', function () {
    it('should get room name from url correctly', function () {
        var result = url.getRoomNameFromURL('/r/myRoomName');
        var expected = 'myRoomName';

        expect(result === expected).to.be.ok();
    })
});
