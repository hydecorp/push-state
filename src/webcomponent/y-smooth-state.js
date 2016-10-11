/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import htmlElement from 'y-component/src/html-element';

import smoothStateCore from '../core';

// Older browsers don't treat `HTMLElement` as a class,
// which would cause an exception from just importing the class below (even when never using it)
// Replacing it with a dummy function prevents this.
const HTMLElement = typeof global.HTMLElement === 'function' ? global.HTMLElement : () => {};

export default class extends htmlElement(smoothStateCore(HTMLElement)) {
  // @override
  setupDOM(el) { // prevents shadow DOM creation
    return el;
  }
}
