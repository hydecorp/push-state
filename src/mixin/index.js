// # src / mixin / index.js
// Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// ## Overview
// This component is written in [RxJS] and reading its code requires some basic understanding
// of how RxJS works. It may also serve as an example of how to use RxJS.
//
// Other than RxJS, you should be familiar with [ES6 Mixin][esmixins],
// which is a clever way of using the ES6 class syntax to achieve inheritance-based mixins.
// The mixin in the main export of this file.

// ## Imports
// Including the patches for ES6+ functions, but
// there is a -lite version of the component that comes without these.
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/from';
import 'core-js/fn/function/bind';
import 'core-js/fn/object/assign';

// Importing the hy-compontent base libary,
// which helps with making multiple versions of the component (Vanilla JS, WebComponent, etc...).
import { componentMixin, COMPONENT_FEATURE_TESTS } from 'hy-component/src/component';

import { array, bool, number, regex, string } from 'attr-types';
import { Set } from 'qd-set';

// Partial polyfill of the URL class. Only provides the most basic funtionality of `URL`,
// but sufficient for this compoennt.
import { URL } from '../url';

import {
  INIT,
  HINT,
  PUSH,
  POP,
  sReload$,
} from './constants';

import {
  restoreScrollPostion,
  updateHistoryState,
  saveScrollHistoryState,
  getTitle,
  getReplaceElements,
} from './methods';

import { onLoad } from './events';

import { setupObservables } from './setup';

export { INIT, HINT, PUSH, POP };

// ## Constants
// A set of [Modernizr] tests that are required to run this component.
// These are the bare-minimum requirements, more ad-hoc features tests for optional behavior
// is part of the code below.
export const MIXIN_FEATURE_TESTS = new Set([
  ...COMPONENT_FEATURE_TESTS,
  'documentfragment',
  'eventlistener',
  'history',
  'promises',
  'queryselector',
  'requestanimationframe',
]);

// Patching the document fragment's `getElementById` function, which is
// not implemented in all browsers, even some modern ones.
DocumentFragment.prototype.getElementById = DocumentFragment.prototype.getElementById ||
  function getElementById(id) { return this.querySelector(`#${id}`); };


// ## Push state mixin
export function pushStateMixin(C) {
  // TODO: see ES6 mixins...
  return class extends componentMixin(C) {
    // The name of the component (required by hy-component)
    static get componentName() { return 'hy-push-state'; }

    // ### Setup
    // Overriding the setup function.
    setupComponent(el, props) {
      super.setupComponent(el, props);

      // Setting up scroll restoration
      if ('scrollRestoration' in window.history && this.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }

      // If restore the last scroll position, if any.
      restoreScrollPostion.call(this);

      // Remember the current scroll position (for F5/reloads).
      window.addEventListener('beforeunload', saveScrollHistoryState.bind(this));

      // Calling the [setup observables function](./setup.md) function.
      setupObservables.call(this);

      // Setting the initial `history.state`.
      const url = new URL(window.location);
      updateHistoryState.call(this, { type: INIT, replace: true, url });

      // After all this is done, we can fire the one-time `init` event...
      this.fireEvent('init');

      // ...and our custom `load` event, which gets fired on every page change.
      // We provide similar data as subsequent `load` events,
      // however we can't provide an `anchor` or `event`,
      // since this `load` event wasn't caused by a user interaction.
      onLoad.call(this, {
        type: INIT,
        title: getTitle.call(this, document),
        replaceEls: getReplaceElements.call(this, document),
        url,
        cacheNr: this.cacheNr,
      });

      // Allow function chaining.
      return this;
    }

    // This component has no shadow DOM, so we just return the element.
    setupShadowDOM(el) { return el; }

    // ### Options
    // The default values (and types) of the configuration options (required by hy-component)
    // See [Options](../../options.md) for usage information.
    static get defaults() {
      return {
        replaceIds: [],
        linkSelector: 'a[href]:not(.no-push-state)',
        scrollRestoration: false,
        duration: 0,
        _hrefRegex: null,
        _scriptSelector: null,
        /* prefetch: true, */
        /* repeatDelay: 500, */
      };
    }

    static get types() {
      return {
        replaceIds: array,
        linkSelector: string,
        scrollRestoration: bool,
        duration: number,
        _hrefRegex: regex,
        _scriptSelector: string,
        /* prefetch: bool, */
        /* repeatDelay: number, */
      };
    }

    // Modifying options of this component doesn't have side effects (so far).
    static get sideEffects() {
      return {};
    }

    // ### Methods
    // Public methods of this component. See [Methods](../../methods.md) for more.
    assign(url) {
      this[sReload$].next({
        type: PUSH,
        url: new URL(url, window.location),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
      });
    }

    reload() {
      this[sReload$].next({
        type: PUSH,
        url: new URL(window.location.href),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }

    replace(url) {
      this[sReload$].next({
        type: PUSH,
        url: new URL(url, window.location),
        cacheNr: ++this.cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }
  };
}

// [rxjs]: https://github.com/ReactiveX/rxjs
// [esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
// [modernizr]: https://modernizr.com/
