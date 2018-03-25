# src / webcomponent / html-import.js
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


```js

import { customElementMixin, CustomElement } from "hy-component/src/custom-element";

import { pushStateMixin } from "../mixin";

const define = () => {
  customElements.define(
    "hy-push-state",
    class extends customElementMixin(pushStateMixin(CustomElement)) {
      static get observedAttributes() {
        return this.getObservedAttributes();
      }
      getTemplate() {
        return null;
      }
    }
  );
};
```

Make sure the polyfills are ready (if they are being used).


```js
if ("customElements" in window || (window.WebComponents && window.WebComponents.ready)) {
  define();
} else if (window.WebComponents) {
  window.addEventListener("WebComponentsReady", define);
} else if (process.env.DEBUG) {
  console.warn("Couldn't register component. Did you forget to include a WebComponents polyfill?");
}
```


