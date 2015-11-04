var logger = require('../common/logger');

var config = require('../config');

var express = require('express');
var path = require('path');
var requestLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');

var helpers = require('./helpers');

var indexRouter = require('./routes/index');
var roomsRouter = require('./routes/rooms');
var apiRouter = require('./routes/api/index');

var redisClient = require('./redisClient');

mongoose.connect(config.mongo.url, {}, function (err) {
    if (err) {
        logger.info(err)
    } else {
        logger.info('Mongoose connected and authenticated');
    }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /static
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));
app.use(requestLogger('dev'));
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'static')));
app.use(express.static(path.join(__dirname, '..', '..', 'build', 'client')));

app.use(helpers);

require('./passport/passport')(passport);
app.use(session({
    store: redisClient.store,
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/r', roomsRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        logger.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
