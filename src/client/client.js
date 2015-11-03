/*
 This file is the entry point on the client side
 */

// add all our polyfills first, so that any later code can rely on them
require('./polyfills');

var logger = require('../common/logger');

var React = require('react');
var ReactDOM = require('react-dom');

var componentRegistry = require('../components/registry');

var mountNode = document.querySelector('.react-mount-node');

var reactType = window.robbie.reactType;
var props = window.robbie.props;

var element = React.createElement(componentRegistry[reactType], props);

ReactDOM.render(element, mountNode, function () {
    logger.info('done');
});
