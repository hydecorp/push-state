// Copyright (c) 2017 Florian Klampfer
// Licensed under MIT

import pushStateCore from '../core';

export default class PushState extends pushStateCore() {
  constructor(el, props) {
    super();
    this.setupComponent(el, props);
  }

  // @override
  setupDOM(el) {
    if (!el) throw Error('No element provided');
    return el;
  }
}
