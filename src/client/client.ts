/*
 This file is the entry point on the client side
 */

// add all our polyfills first, so that any later code can rely on them
import './polyfills';

import logger from '../common/logger';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import componentRegistry from '../components/registry.js';

const mountNode = document.querySelector('.react-mount-node');

const reactType: string = (<any>window).robbie.reactType;
const props = (<any>window).robbie.props;

// I'm not happy with the typing of this and plan to come back to it
function getComponent<T, K extends keyof T>(registry: T, key: string) {
    return registry[<K>key];
}
const component = getComponent(componentRegistry, reactType);

const element = React.createElement(component, props);

ReactDOM.render(element, mountNode, function () {
    logger.info('done');
});
