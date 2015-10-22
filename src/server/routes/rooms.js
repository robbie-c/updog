var express = require('express');
var router = express.Router();

router.get('/:roomName', function (req, res) {

    var roomName = req.params['roomName'];

    console.log(req.params);

    // TODO check that room is real, and user can see it

    var props = {
        chatMessages: [], // TODO
        participants: []
    };

    res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
});

module.exports = router;
