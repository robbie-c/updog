var express = require('express');
var router = express.Router();
var componentRegistry = require('../../components/registry');

var React = require('react');

/* GET home page. */
router.get('/', function (req, res, next) {

    var reactType = "PermanentCallPage";
    var props = {};

    res.render('page', {
        React: React,
        title: 'Permanent Call',
        component: React.createElement(componentRegistry[reactType], props),
        reactType: reactType,
        props: props
    });
});

module.exports = router;
