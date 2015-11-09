var express = require('express');
var router = express.Router();

var errors = require('../../../common/errors');
var httpStatus = require('http-status');

import * as modelUser from '../../models/user';
var Room = require('../../models/room');

router.post('/claimRoom', function (req, res) {
    var roomName = req.body.data;

    if (!req.isAuthenticated() || !req.user) {
        return res.apiFailure(httpStatus.UNAUTHORIZED);
    }

    Room.findOneAndUpdate({
        _id: roomName,
        ownerUserId: null
    }, {
        ownerUserId: req.user._id
    }, {
        new: true
    }, function (err, room) {
        if (err) {
            return res.apiFailure(err);
        } else if (!room) {
            return res.apiFailure(httpStatus.NOT_FOUND);
        } else {
            res.apiSuccess({
                room: room // TODO sanitize
            });
        }
    });
});

router.post('/updateSetting', function (req, res) {
    var roomName = req.body.data.roomName;
    var key = req.body.data.key;
    var val = req.body.data.val;

    if (!req.isAuthenticated() || !req.user) {
        return res.apiFailure(httpStatus.UNAUTHORIZED);
    }

    var update;

    switch (key) {
        case 'video':
            if (typeof val !== 'boolean') {
                return res.apiFailure(new errors.ValidationError('room.settings.video.invalid', val));
            } else {
                update = {
                    'settings.video': val
                }
            }
            break;
        default:
            return res.apiFailure(new errors.ValidationError('room.settings.invalidKey', key))
    }

    if (update) {
        Room.findOneAndUpdate({
            _id: roomName,
            ownerUserId: req.user._id
        }, update, {
            new: true
        }, function (err, room) {
            if (err) {
                return res.apiFailure(err);
            } else if (!room) {
                return res.apiFailure(httpStatus.NOT_FOUND);
            } else {
                return res.apiSuccess(room.settings);
            }
        });
    } else {
        return res.apiFailure();
    }
});

module.exports = router;
