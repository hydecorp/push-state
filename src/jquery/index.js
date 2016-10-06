/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */
/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import defineJQueryComponent from 'y-component/src/define-jquery-component';

import smoothStateCore from '../core';

defineJQueryComponent('smoothState', class extends smoothStateCore() {
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
