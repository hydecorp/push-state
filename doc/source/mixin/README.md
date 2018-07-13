# src / mixin / index.js
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

## Overview
This component is written in [RxJS] and reading its code requires some basic understanding
of how RxJS works. It may also serve as an example of how to use RxJS.

Other than RxJS, you should be familiar with [ES6 Mixin][esmixins],
which is a clever way of using the ES6 class syntax to achieve inheritance-based mixins.
The mixin in the main export of this file.

## Imports
Including the patches for ES6+ functions, but
there is a -lite version of the component that comes without these.
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/from';
import 'core-js/fn/function/bind';
import 'core-js/fn/object/assign';

Importing the hy-compontent base libary,
which helps with making multiple versions of the component (Vanilla JS, WebComponent, etc...).


```js
import { componentMixin, COMPONENT_FEATURE_TESTS, Set } from "hy-component/src/component";
import { rxjsMixin } from "hy-component/src/rxjs";
import { array, bool, number, regex, string } from "hy-component/src/types";

import { Subject } from "rxjs/_esm5";
```

Partial polyfill of the URL class. Only provides the most basic funtionality of `URL`,
but sufficient for this compoennt.


```js
import { URL } from "../url";
import { isExternal } from "../common";

import { INIT, HINT, PUSH, POP } from "./constants";
import { setupObservablesMixin } from "./setup";

export { INIT, HINT, PUSH, POP };
```

## Constants
A set of [Modernizr] tests that are required to run this component.
These are the bare-minimum requirements, more ad-hoc features tests for optional behavior
is part of the code below.


```js
export const MIXIN_FEATURE_TESTS = new Set([
  ...COMPONENT_FEATURE_TESTS,
  "documentfragment",
  "eventlistener",
  "history",
  "promises",
  "queryselector",
  "requestanimationframe",
]);

export { Set };
```

Patching the document fragment's `getElementById` function, which is
not implemented in all browsers, even some modern ones.


```js
DocumentFragment.prototype.getElementById =
  DocumentFragment.prototype.getElementById ||
  function getElementById(id) {
    return this.querySelector(`#${id}`);
  };
```

## Push state mixin


```js
export const pushStateMixin = C =>
  class extends setupObservablesMixin(rxjsMixin(componentMixin(C))) {
```

The name of the component (required by hy-component)


```js
    static get componentName() {
      return "hy-push-state";
    }
```

### Options
The default values (and types) of the configuration options (required by hy-component)
See [Options](../../options.md) for usage information.


```js
    static get types() {
      return {
        replaceIds: array,
        linkSelector: string,
        duration: number,
        hrefRegex: regex,
        scriptSelector: string,
        initialHref: string,
        prefetch: bool,
      };
    }

    static get defaults() {
      return {
        replaceIds: [],
        linkSelector: "a[href]:not(.no-push-state)",
        duration: 0,
        hrefRegex: null,
        scriptSelector: null,
        initialHref: window.location.href,
        prefetch: false,
      };
    }
```

### Properties
We expose the same properties as `window.location`
(in many ways this component can be thought of as a "replacement" for the global `Location` object).
Currently they are read-only.


```js
    get hash() {
      return this._url.hash;
    }

    get host() {
      return this._url.host;
    }

    get hostname() {
      return this._url.hostname;
    }

    get href() {
      return this._url.href;
    }

    get origin() {
      return this._url.origin;
    }

    get pathname() {
      return this._url.pathname;
    }

    get port() {
      return this._url.port;
    }

    get protocol() {
      return this._url.protocol;
    }

    get search() {
      return this._url.search;
    }
```

### Setup


```js
    setupComponent(el, props) {
      super.setupComponent(el, props);

      this.saveScrollPosition = this.saveScrollPosition.bind(this);

      this.reload$ = new Subject();
    }
```

This component has no shadow DOM, so we just return the element.


```js
    setupShadowDOM(el) {
      return el;
    }
```

Overriding the setup function.


```js
    connectComponent() {
      if (process.env.DEBUG && !this.replaceIds && !this.el.id)
        console.warn("hy-push-state needs a 'replace-ids' or 'id' attribute.");
```

Setting up scroll restoration


```js
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
```

Restore the last scroll position, if any.


```js
      this.restoreScrollPostionOnReload();
```

Remember the current scroll position (for F5/reloads).


```js
      window.addEventListener("beforeunload", this.saveScrollPosition);
```

Calling the [setup observables function](./setup.md) function.


```js
      this.setupObservables();
```

TODO: meh...


```js
      super.connectComponent();
```

Setting the initial `history.state`.


```js
      const url = new URL(this.initialHref);
      this.updateHistoryState({ type: INIT, replace: true, url });

      const replaceEls = this.getReplaceElements(document);
      if (isExternal(this)) this.rewriteURLs(replaceEls);
```

After all this is done, we can fire the one-time `init` event...


```js
      this.fireEvent("init");
```

...and our custom `load` event, which gets fired on every page change.
We provide similar data as subsequent `load` events,
however we can't provide an `anchor` or `event`,
since this `load` event wasn't caused by a user interaction.


```js
      this.onLoad({
        type: INIT,
        title: this.getTitle(document),
        replaceEls,
        url,
        cacheNr: this.cacheNr,
      });
    }

    disconnectComponent() {
      super.disconnectComponent();
      window.removeEventListener("beforeunload", this.saveScrollPosition);
    }
```

### Methods
Public methods of this component. See [Methods](../../methods.md) for more.


```js
    assign(url) {
      this.reload$.next({
        type: PUSH,
        url: new URL(url, this.href),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
      });
    }

    reload() {
      this.reload$.next({
        type: PUSH,
        url: new URL(this.href),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }

    replace(url) {
      this.reload$.next({
        type: PUSH,
        url: new URL(url, this.href),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }
  };
```

[rxjs]: https://github.com/ReactiveX/rxjs
[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
[modernizr]: https://modernizr.com/


