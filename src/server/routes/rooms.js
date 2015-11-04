var express = require('express');
var router = express.Router();

var logger = require('../../common/logger');

router.get('/:roomName', function (req, res) {

    var roomName = req.params['roomName'];

    // TODO check that room is real, and user can see it

    var props = {
        chatMessages: [], // TODO
        participants: [],
        user: req.user, // TODO sanitized version
        roomName: roomName
    };

    res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
});

module.exports = router;
