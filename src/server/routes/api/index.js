var express = require('express');
var router = express.Router();

var errors = require('../../../common/errors');

var userRouter = require('./user');
var roomRouter = require('./room');

// attach API sub-routers
router.use('/user', userRouter);
router.use('/room', roomRouter);

// API error handler
router.use(function(err, req, res, next) {
    // don't actually send a status code other than 200
    // instead send a JSON object containing the code

    res.json({
        status: 'failure',
        statusCode: err.status || 500,
        error: errors.serializeError(err)
    });
});

module.exports = router;
