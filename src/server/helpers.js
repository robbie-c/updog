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

    next();
}

module.exports = attachHelpers;
