var express = require('express');
var router = express.Router();

var logger = require('../../common/logger');

router.get('/:roomName', function (req, res) {

    var roomName = req.params['roomName'];

    logger.info(req.params);

    // TODO check that room is real, and user can see it

    var props = {
        chatMessages: [], // TODO
        participants: []
    };

    res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
});

module.exports = router;
