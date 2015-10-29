var express = require('express');
var router = express.Router();

var errors = require('../../../common/errors');


router.post('/completeProfile', function(req, res) {
    throw new errors.ValidationError('my emotions!');
});


module.exports = router;
