/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import htmlElement from 'y-component/src/htmlElement';

import smoothStateCore from '../core';

// function hasShadowDOMV0() {
//   return 'createShadowRoot' in document.body;
// }
//
// function hasShadowDOMV1() {
//   return 'attachShadow' in document.body;
// }
//
// function getTemplateInstance(version) {
//   const template = document.getElementById(`y-smooth-state-template-${version}`) ||
//     document.querySelector('link[href$="y-smooth-state.html"]')
//       .import
//       .getElementById(`y-smooth-state-template-${version}`);
//   return template.content.cloneNode(true);
// }

export default class HTMLYDrawerElement extends htmlElement(smoothStateCore(HTMLElement)) {
  connectedCallback() {
    this.createdConnected();
  }

  createdCallback() {
    this.createdConnected();
  }

  // @override
  setupDOM(el) {
    return el;
    // if (hasShadowDOMV1()) {
    //   el.attachShadow({ mode: 'open' });
    //   const instance = getTemplateInstance('v1');
    //   el.shadowRoot.appendChild(instance);
    //   return el.shadowRoot;
    // } else if (hasShadowDOMV0()) {
    //   const shadowRoot = el.createShadowRoot();
    //   const instance = getTemplateInstance('v0');
    //   shadowRoot.appendChild(instance);
    //   return shadowRoot;
    // }
    // throw Error('ShadowDOM API not supported (neither v0 nor v1)');
  }
}
