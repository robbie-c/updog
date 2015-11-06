var express = require('express');
var router = express.Router();

var logger = require('../../common/logger');

var Room = require('../models/room');

router.get('/:roomName', function (req, res, next) {

    var roomName = req.params['roomName'];

    Room.findOrCreateDefault(roomName)
        .then(function (room) {
            if (room.canBeAccessedByUser(req.user)) {
                var props = {
                    chatMessages: [], // TODO
                    participants: [],
                    user: req.user, // TODO sanitized version
                    room: room // TODO sanitized version
                };
                res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
            } else {
                res.reactRender('Permission Denied: ' + roomName, 'PermissionDeniedPage');
            }
        })
        .catch(function (err) {
            next(err);
        });
});

module.exports = router;
