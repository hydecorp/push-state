/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import htmlElement from 'y-component/src/html-element';

import smoothStateCore from '../core';

export default class extends htmlElement(smoothStateCore(HTMLElement)) {
  // @override
  setupDOM(el) { // don't use shadow DOM
    return el;
  }
}
