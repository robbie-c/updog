var $ = require('jquery');
var React = require('react');

var componentRegistry = require('../components/registry');

var mountNode = document.querySelector('.react-mount-node');

var reactType = window.robbie.reactType;
var props = window.robbie.props;

var element = React.createElement(componentRegistry[reactType], props);


React.render(element, mountNode, function() {
    console.log("done");
});