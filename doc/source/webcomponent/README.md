# src / webcomponent / index.js
Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

import 'core-js/fn/array/from';


```js

import {
  customElementMixin,
  CustomElement,
  CUSTOM_ELEMENT_FEATURE_TESTS,
  Set,
} from "hy-component/src/custom-element";

import { pushStateMixin, MIXIN_FEATURE_TESTS } from "../mixin";

export const WEBCOMPONENT_FEATURE_TESTS = new Set([
  ...CUSTOM_ELEMENT_FEATURE_TESTS,
  ...MIXIN_FEATURE_TESTS,
]);

export { Set };

export class HyPushStateElement extends customElementMixin(pushStateMixin(CustomElement)) {
  static get observedAttributes() {
    return this.getObservedAttributes();
  }
  getTemplate() {
    return null;
  }
}
```


