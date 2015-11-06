var express = require('express');
var router = express.Router();
var async = require('async');

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

module.exports = router;
