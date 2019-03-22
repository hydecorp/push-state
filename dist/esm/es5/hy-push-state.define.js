
// HyPushState: Custom Elements Define Library, ES Module/es5 Target

import { defineCustomElement } from './hy-push-state.core.js';
import { COMPONENTS } from './hy-push-state.components.js';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, COMPONENTS, opts);
}
