var express = require('express');
var router = express.Router();

var errors = require('../../../common/errors');

import * as modelUser from '../../models/user';


router.post('/completeProfile', function (req, res) {
    // TODO must be logged in

    modelUser.completeProfile(req.user, req.body.data, res.apiCallback);
});


module.exports = router;
