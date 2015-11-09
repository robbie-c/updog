var componentRegistry = require('../components/registry');
var React = require('react');
var ReactDOMServer = require('react-dom/server');

var errors = require('../common/errors');
var logger = require('../common/logger');

function attachHelpers(req, res, next) {
    res.reactRender = function (title, reactClassName, props) {

        props = props || {};

        if (!props.title) {
            props.title = title;
        }
        if (!props.user && req.isAuthenticated() && req.user) {
            props.user = req.user.sanitise();
        }

        var component = React.createElement(componentRegistry[reactClassName], props);

        res.render('page', {
            React: React,
            ReactDOMServer: ReactDOMServer,
            title: title,
            component: component,
            reactType: reactClassName,
            props: props
        });
    };

    res.apiSuccess = function (data) {
        res.json({
            status: 'success',
            data: data
        });
    };

    res.apiFailure = function (err) {
        logger.error(err);
        res.json({
            status: 'failure',
            error: errors.serializeError(err)
        });
    };

    res.apiCallback = function (err, data) {
        if (err) {
            res.apiFailure(err);
        } else {
            res.apiSuccess(data);
        }
    };

    res.apiPromise = function (promise) {
        promise
            .then(function (data) {
                res.apiSuccess(data);
            })
            .catch(function (err) {
                res.apiFailure(err);
            })
    };

    next();
}

module.exports = attachHelpers;
