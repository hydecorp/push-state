/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import htmlElement from 'y-component/src/htmlElement';

import smoothStateCore from '../core';

export default class HTMLYDrawerElement extends htmlElement(smoothStateCore(HTMLElement)) {
  connectedCallback() {
    this.createdConnected();
  }

  createdCallback() {
    this.createdConnected();
  }

  getTemplateInstance(version) {
    const name = 'y-smooth-state';
    return document
        .querySelector(`link[href$="${name}.html"]`)
        .import
        .getElementById(`${name}-template-${version}`)
        .content
        .cloneNode(true);
  }

  // @override
  setupDOM(el) {
    return el;
  }
}
