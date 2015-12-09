var express = require('express');
var router = express.Router();

var logger = require('../../common/logger');

var Room = require('../models/room');

router.get('/:roomName', function (req, res, next) {

    var roomName = req.params['roomName'];

    Room.findOrCreateDefault(roomName)
        .then(function (room) {
            if (room.canBeAccessedByUser(req.user)) {
                room.sanitiseWithUsers(function (err, roomSanitised) {
                    if (err) {
                        next(err);
                    } else {
                        var props = {
                            chatMessages: [], // TODO
                            participants: [],
                            initialRoom: roomSanitised
                        };
                        res.reactRender('Chat Room: ' + roomName, 'PermanentCallPage', props);
                    }
                });
            } else {
                res.reactRender('Permission Denied: ' + roomName, 'PermissionDeniedPage');
            }
        })
        .catch(function (err) {
            next(err);
        });
});

router.get('/', function (req, res) {
    res.reactRender('Rooms', 'RoomsPage')
});

module.exports = router;
