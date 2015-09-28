var express = require('express');
var router = express.Router();

router.get('/:roomName', function (req, res) {

    var roomName = req.param('roomName');

    // TODO check that room is real, and user can see it

    var props = {
        chatMessages: [] // TODO
    };

    res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
});

module.exports = router;
