/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */
/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import defineJQueryComponent from 'y-component/src/define-jquery-component';

import pushStateCore from '../core';

defineJQueryComponent('pushState', class extends pushStateCore() {
  constructor(el, props) {
    super();
    this.setupComponent(el, props);
  }

  // @override
  setupDOM(el) {
    if (!el) throw Error('No element provided');
    return el;
  }
});
