/*
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

import HTMLYPushStateElement from './y-push-state';

const templateV1 = `
  <!-- @include ./template-v1.html -->
`;

const templateV0 = `
  <!-- @include ./template-v0.html -->
`;

function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}

export default class extends HTMLYPushStateElement {
  getTemplateInstance(version) {
    switch (version) {
      case 'v1': return fragmentFromString(templateV1);
      case 'v0': return fragmentFromString(templateV0);
      default: throw Error();
    }
  }
}
