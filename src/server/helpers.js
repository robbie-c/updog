var componentRegistry = require('../components/registry');
var React = require('react');

function attachHelpers(req, res, next) {
    res.reactRender = function (title, reactClassName, props) {

        props = props || {};

        var component = React.createElement(componentRegistry[reactClassName], props);

        console.log(component);

        res.render('page', {
            React: React,
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

    next();
}

module.exports = attachHelpers;
