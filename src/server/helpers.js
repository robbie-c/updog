var express = require('express');
var componentRegistry = require('../components/registry');
var React = require('react');

function attachHelpers(req, res, next) {
    res.reactRender = function (title, reactClassName, props) {

        props = props || {};

        res.render('page', {
            React: React,
            title: title,
            component: React.createElement(componentRegistry[reactClassName], props),
            reactType: reactClassName,
            props: props
        });
    };

    next();
}

module.exports = attachHelpers;