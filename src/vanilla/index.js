/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */
import smoothStateCore from '../core';

export default class SmoothState extends smoothStateCore() {
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
