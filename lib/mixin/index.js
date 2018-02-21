'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POP = exports.PUSH = exports.HINT = exports.INIT = exports.sSetupDOM = exports.sSetup = exports.MIXIN_FEATURE_TESTS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.pushStateMixin = pushStateMixin;

require('core-js/fn/array/for-each');

require('core-js/fn/array/from');

require('core-js/fn/function/bind');

require('core-js/fn/object/assign');

var _component = require('hy-component/src/component');

var _symbols = require('hy-component/src/symbols');

var _Observable = require('rxjs/Observable');

var _Subject = require('rxjs/Subject');

var _animationFrame = require('rxjs/scheduler/animationFrame');

var _defer = require('rxjs/observable/defer');

var _from = require('rxjs/observable/from');

var _fromEvent = require('rxjs/observable/fromEvent');

var _merge = require('rxjs/observable/merge');

var _never = require('rxjs/observable/never');

var _of = require('rxjs/observable/of');

var _timer = require('rxjs/observable/timer');

var _ajax = require('rxjs/observable/dom/ajax');

var _catch = require('rxjs/operator/catch');

var _do = require('rxjs/operator/do');

var _concatMap = require('rxjs/operator/concatMap');

var _distinctUntilChanged = require('rxjs/operator/distinctUntilChanged');

var _filter = require('rxjs/operator/filter');

var _map3 = require('rxjs/operator/map');

var _mapTo = require('rxjs/operator/mapTo');

var _observeOn = require('rxjs/operator/observeOn');

var _partition = require('rxjs/operator/partition');

var _pairwise = require('rxjs/operator/pairwise');

var _share = require('rxjs/operator/share');

var _startWith = require('rxjs/operator/startWith');

var _switchMap = require('rxjs/operator/switchMap');

var _take = require('rxjs/operator/take');

var _takeUntil = require('rxjs/operator/takeUntil');

var _toPromise = require('rxjs/operator/toPromise');

var _withLatestFrom = require('rxjs/operator/withLatestFrom');

var _zip = require('rxjs/operator/zip');

var _attrTypes = require('attr-types');

var _qdSet = require('qd-set');

var _url = require('../url');

var _common = require('../common');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // # src / mixin / index.js
// Copyright (c) 2017 Florian Klampfer <https://qwtel.com/>
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
// of how RxJS works. It may also serve as an example of how to use RxJS (or how not to use it...).
//
// Other than RxJS, you should be familiar with the (non-standard) function-bind syntax `::`,
// which is extremely helpful with using RxJS operators *as if* they were class methods,
// as well as writing private functions for our mixin.
//
// Finally, the export is a [ES6 Mixin][esmixins],
// which is a clever way of using the ES6 class syntax to achieve inheritance-based mixins.

// ## Table of Contents
// {:.no_toc}
// * Table of Contents
// {:toc}

// ## Imports
// Including the patches for ES6+ functions, but
// there is a -lite version of the component that comes without these.


// Importing the hy-compontent base libary,
// which helps with making multiple versions of the component (Vanilla JS, WebComponent, etc...).


// Importing the subset of RxJS functions that we are going to use.
// Note that some of these have been renamed to avoid conflicts with keywords,
// to avoid implementation specific names and conflicts within the library itself.
// * `do` → `tap`
// * `catch` → `catchError`
// * `zipProto` → `zip`


// Partial polyfill of the URL class. Only provides the most basic funtionality of `URL`,
// but sufficient for this compoennt.


// Some of our own helper functions from [src / common.js](../common.md).


// ## Constants
// A set of [Modernizr] tests that are required to run this component.
// These are the bare-minimum requirements, more ad-hoc features tests for optional behavior
// is part of the code below.
var MIXIN_FEATURE_TESTS = exports.MIXIN_FEATURE_TESTS = new _qdSet.Set([].concat(_toConsumableArray(_component.COMPONENT_FEATURE_TESTS), ['documentfragment', 'eventlistener', 'history', 'promises', 'queryselector', 'requestanimationframe']));

// We export the setup symbols,
// so that mixin users don't have to import them from hy-compnent separately.
exports.sSetup = _symbols.sSetup;
exports.sSetupDOM = _symbols.sSetupDOM;

// These are some 'types' that we use throught the component.
// Going with strings here instead of classes + instanceof / dynamic dispatch for simplicity.

var INIT = exports.INIT = 'init';
var HINT = exports.HINT = 'hint';
var PUSH = exports.PUSH = 'push';
var POP = exports.POP = 'pop';

// If Symbol isn't supported, just use underscore naming convention for private properties.
// We don't need advanced features of Symbol.
var _Symbol = global.Symbol || function (x) {
  return '_' + x;
};

// We use `Symbol`s for all internal variables, to avoid naming conflicts when using the mixin.
var sAnimPromise = _Symbol('animPromise');
var sReload$ = _Symbol('reloadObservable');

// For convenience....
var _Array$prototype = Array.prototype,
    forEach = _Array$prototype.forEach,
    indexOf = _Array$prototype.indexOf;

var assign = Object.assign.bind(Object);

// Patching the document fragment's `getElementById` function, which is
// not implemented in all browsers, even some modern ones.
DocumentFragment.prototype.getElementById = DocumentFragment.prototype.getElementById || function getElementById(id) {
  return this.querySelector('#' + id);
};

// ## Functions
// What you will notice about the following helper functions is that many make reference to `this`.
// This is because they are invoked with the `::` operator, binding `this` to the component,
// effectively turning them into (private) methods. Since the final export is a mixin,
// we want to avoid potentially conflicting names as much as possible.

// ### Observable extensions
// #### Unsubscribe when
// This operator unsubscribes from the source observable when `pauser$` emits a truthy value,
// and re-subscribes when it emits a falsy value.
function unsubscribeWhen(pauser$) {
  var _this = this;

  if (process.env.DEBUG && !pauser$) throw Error();
  return _switchMap.switchMap.call(pauser$, function (paused) {
    return paused ? _never.never.call(_Observable.Observable) : _this;
  });
}

// #### Custom subscribe
// A custom subscribe function that will `recover` from an error and log it to the console.
// This is a line of last defense to make sure the entire pipeline/page doesn't crash.
// TODO: maybe just let it crash s.t. the page reloads on the next click on a link!?
function subscribe(ne, er, co) {
  var _context;

  var res = this;
  if (process.env.DEBUG) res = _do._do.call(this, { error: (_context = console).error.bind(_context) });
  return (_context = res, _catch._catch).call(_context, function (e, c) {
    return c;
  }).subscribe(ne, er, co);
}

// ### Event filters
function shouldLoadAnchor(anchor, hrefRegex) {
  return anchor && anchor.target === '' && (!hrefRegex || anchor.href.search(hrefRegex) !== -1);
}

function isPushEvent(_ref) {
  var metaKey = _ref.metaKey,
      ctrlKey = _ref.ctrlKey,
      currentTarget = _ref.currentTarget;

  return !metaKey && !ctrlKey && shouldLoadAnchor(currentTarget, this._hrefRegex) && !(0, _common.isExternal)(currentTarget);
}

function isHintEvent(_ref2) {
  var currentTarget = _ref2.currentTarget;

  return shouldLoadAnchor(currentTarget, this._hrefRegex) && !(0, _common.isExternal)(currentTarget) && !(0, _common.isHash)(currentTarget);
}

// ### Managing scroll positions
// The following functions deal with managing the scroll position of the site.

// Returns an identifier to mark frames on the history stack.
function histId() {
  return this.el.id || this.constructor.componentName;
}

// Given a hash, find the element of the same id on the page, and scroll it into view.
// If no hash is provided, scroll to the top instead.
function scrollHashIntoView(hash) {
  if (hash) {
    var el = document.getElementById(hash.substr(1));
    if (el) el.scrollIntoView();else if (process.env.DEBUG) console.warn('Can\'t find element with id ' + hash);
  } else window.scroll(window.pageXOffset, 0);
}

// Takes the current history state, and restores the scroll position.
function restoreScrollPostion() {
  var id = histId.call(this);
  var state = window.history.state && window.history.state[id] || {};

  if (state.scrollTop != null) {
    document.body.style.minHeight = state.scrollHeight;
    window.scroll(window.pageXOffset, state.scrollTop);
    /* document.body.style.minHeight = ''; */
  } else if (state.hash) {
    scrollHashIntoView(window.location.hash);
  }
}

// TODO
function manageScrollPostion(_ref3) {
  var type = _ref3.type,
      hash = _ref3.url.hash;

  if (type === PUSH) {
    scrollHashIntoView(hash);
  }

  if (type === POP && this.scrollRestoration) {
    restoreScrollPostion.call(this);
  }
}

function saveScrollPosition(state) {
  var id = histId.call(this);
  return assign(state, _defineProperty({}, id, assign(state[id] || {}, {
    scrollTop: (0, _common.getScrollTop)(),
    scrollHeight: (0, _common.getScrollHeight)()
  })));
}

function updateHistoryState(_ref4) {
  var type = _ref4.type,
      replace = _ref4.replace,
      _ref4$url = _ref4.url,
      href = _ref4$url.href,
      hash = _ref4$url.hash;

  if (type === PUSH || type === INIT) {
    var id = histId.call(this);
    var method = replace || href === window.location.href ? 'replaceState' : 'pushState';
    window.history[method](_defineProperty({}, id, { hash: !!hash }), '', href);
  }
}

function updateHistoryStateHash(_ref5) {
  var type = _ref5.type,
      url = _ref5.url;
  var hash = url.hash,
      href = url.href;


  if (type === PUSH) {
    var id = histId.call(this);
    var currState = assign(window.history.state, _defineProperty({}, id, assign(window.history.state[id], { hash: true })));
    var nextState = _defineProperty({}, id, { hash: true });
    window.history.replaceState(currState, document.title, window.location.href);
    window.history.pushState(nextState, document.title, href);
  }

  scrollHashIntoView(hash);
}

function saveScrollHistoryState() {
  var state = saveScrollPosition.call(this, window.history.state || {});
  window.history.replaceState(state, document.title, window.location);
}

// ### Fetching
function hrefToAjax(_ref6) {
  var url = _ref6.url;

  return {
    method: 'GET',
    responseType: 'text',
    url: url
  };
}

// The `ajax` method will throw when it encoutners an a 400+ status code,
// however these are still valid responses from the server, that can be shown using this component.
// This assumes error pages have the same HTML strcuture as the other pages though.
function recoverIfResponse(context, error) {
  var status = error.status,
      xhr = error.xhr;

  // If we have a response, recover with it and continue with the pipeline.

  if (xhr && xhr.response && status > 400) {
    return _of.of.call(_Observable.Observable, assign(context, { response: xhr.response }));
  }

  // If we don't have a response, this is an acutal error that should be dealt with.
  return _of.of.call(_Observable.Observable, assign(context, { error: error }));
}

// TODO
function fetchPage(context) {
  var _context2,
      _this2 = this;

  return (_context2 = (_context2 = _ajax.ajax.call(_Observable.Observable, hrefToAjax(context)), _map3.map).call(_context2, function (_ref7) {
    var response = _ref7.response;
    return assign(context, { response: response });
  }), _catch._catch).call(_context2, function (error) {
    return recoverIfResponse.call(_this2, context, error);
  });
}

// This function returns the request that matches a given URL.
// The way the pipeline is set up, it is either the current `prefetch` value,
// or the next value on the prefetch observable.
// TODO: rename
function getFetch$(_ref8, latestPrefetch, prefetch$) {
  var href = _ref8.url.href;

  return href === latestPrefetch.url.href && latestPrefetch.error == null ? _of.of.call(_Observable.Observable, latestPrefetch) : _take.take.call(prefetch$, 1);
}

// TODO: rename
function getResponse(prefetch$, _ref9) {
  var _context3;

  var _ref10 = _slicedToArray(_ref9, 2),
      context = _ref10[0],
      latestPrefetch = _ref10[1];

  return (_context3 = (_context3 = getFetch$(context, latestPrefetch, prefetch$), _map3.map).call(_context3, function (fetch) {
    return assign(fetch, context);
  }), _zip.zipProto).call(_context3, this[sAnimPromise], function (x) {
    return x;
  });
}

// ### Experimental script feature
// TODO

// This function removes all script tags (as query'ed by `_scriptSelector`) from the response.
function tempRemoveScriptTags(replaceEls) {
  var _this3 = this;

  var scripts = [];

  replaceEls.forEach(function (docfrag) {
    var _context4;

    return (_context4 = docfrag.querySelectorAll(_this3._scriptSelector), forEach).call(_context4, function (script) {
      var pair = [script, script.previousSibling];
      script.parentNode.removeChild(script);
      scripts.push(pair);
    });
  });

  return scripts;
}

// Attempts to (synchronously) insert a `script` tag into the DOM, *before* a given `ref` element.
function insertScript(_ref11) {
  var _context6;

  var _ref12 = _slicedToArray(_ref11, 2),
      script = _ref12[0],
      ref = _ref12[1];

  // Temporarily overwrite `document.wirte` to simulate its behavior during the initial load.
  // This only works because scripts are inserted one-at-a-time (via `concatMap`).
  var originalWrite = document.write;

  document.write = function () {
    var _context5;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var temp = document.createElement('div');
    temp.innerHTML = args.join();
    (_context5 = temp.childNodes, forEach).call(_context5, function (node) {
      ref.parentNode.insertBefore(node, ref.nextSibling);
    });
  };

  // If the script tag needs to fetch its source code, we insert it into the DOM,
  // but we return an observable that only completes once the script has fired its `load` event.
  return script.src !== '' ? _Observable.Observable.create(function (observer) {
    script.addEventListener('load', function (x) {
      document.write = originalWrite;
      observer.complete(x);
    });

    script.addEventListener('error', function (x) {
      document.write = originalWrite;
      observer.error(x);
    });

    ref.parentNode.insertBefore(script, ref.nextSibling);
  }) :

  // Otherwise we insert it into the DOM and reset the `document.write` function.
  (_context6 = _of.of.call(_Observable.Observable, {}), _do._do).call(_context6, function () {
    ref.parentNode.insertBefore(script, ref.nextSibling);
    document.write = originalWrite;
  });
}

// Takes a list of `script`--`ref` pairs, and inserts them into the DOM one-by-one.
function reinsertScriptTags(context) {
  var _context7;

  var scripts = context.scripts;


  return (_context7 = (_context7 = (_context7 = _from.from.call(_Observable.Observable, scripts), _concatMap.concatMap).call(_context7, insertScript), _catch._catch).call(_context7, function (error) {
    throw assign(context, { error: error });
  }), _toPromise.toPromise).call(_context7).then(function () {
    return context;
  });
}

// ### Content replacement
// TODO
function getTitle(fragment) {
  return (fragment.querySelector('title') || {}).textContent;
}

function getReplaceElements(fragment) {
  if (this.replaceIds.length > 0) {
    return this.replaceIds.map(function (id) {
      return fragment.getElementById(id);
    });
  } else {
    var replaceEl = void 0;
    if (this.el.id) {
      replaceEl = fragment.getElementById(this.el.id);
    } else {
      var _context8;

      var index = (_context8 = document.getElementsByTagName(this.el.tagName), indexOf).call(_context8, this.el);
      replaceEl = fragment.querySelectorAll(this.el.tagName)[index];
    }
    return [replaceEl];
  }
}

function responseToContent(context) {
  var response = context.response;


  var fragment = (0, _common.fragmentFromString)(response);
  var title = getTitle.call(this, fragment);
  var replaceEls = getReplaceElements.call(this, fragment);

  if (replaceEls.some(function (x) {
    return x == null;
  })) {
    throw assign(context, { relaceElMissing: true });
  }

  var scripts = this._scriptSelector ? tempRemoveScriptTags.call(this, replaceEls) : [];

  return assign(context, { title: title, replaceEls: replaceEls, scripts: scripts });
}

function replaceContentByIds(elements) {
  this.replaceIds.map(function (id) {
    return document.getElementById(id);
  }).forEach(function (oldElement, i) {
    oldElement.parentNode.replaceChild(elements[i], oldElement);
  });
}

function replaceContentWholesale(_ref13) {
  var _ref14 = _slicedToArray(_ref13, 1),
      el = _ref14[0];

  this.el.innerHTML = el.innerHTML;
}

function replaceContent(replaceEls) {
  if (this.replaceIds.length > 0) {
    replaceContentByIds.call(this, replaceEls);
  } else {
    replaceContentWholesale.call(this, replaceEls);
  }
}

function updateDOM(context) {
  try {
    var title = context.title,
        replaceEls = context.replaceEls,
        type = context.type;


    document.title = title;

    if (type === PUSH) {
      window.history.replaceState(window.history.state, title, window.location);
    }

    replaceContent.call(this, replaceEls);
  } catch (error) {
    throw assign(context, { error: error });
  }
}

// ### Event functions
// These functions are called at various points along the observable pipeline to fire events,
// and cause other side effects.

// #### On start
function onStart(context) {
  var _this4 = this;

  // By default, hy-push-state will wait at least `duration` ms before replacing the content,
  // so that animations have enough time to finish.
  // The behavior is encoded with a promise that resolves after `duration` ms.
  this[sAnimPromise] = _timer.timer.call(_Observable.Observable, this.duration);

  // The `waitUntil` function lets users of this component override the animation promise.
  // This allows for event-based code execution, rather than timing-based, which prevents hiccups
  // and glitches when, for example, painting takes longer than expected.
  var waitUntil = function waitUntil(promise) {
    if (process.env.DEBUG && !(promise instanceof Promise || promise instanceof _Observable.Observable)) {
      console.warn('waitUntil expects a Promise as first argument.');
    }
    _this4[sAnimPromise] = promise;
  };

  this[_symbols.sFire]('start', { detail: assign(context, { waitUntil: waitUntil }) });
}

// Example usage of `waitUntil`:
//
// ```js
// hyPushStateEl.addEventListener('hy-push-state-start', ({ detail }) => {
//   const animPromise = new Promise((resolve) => {
//     const anim = myContent.animate(...);
//     anim.addEventListener('finish', resolve);
//   });
//   detail.waitUntil(animPromise);
// });
// ```
// {:style="font-style:italic"}

// #### Error callbacks
// This function handles errors while trying to insert the new content into the document.
// If the retrieved documened doesn't contain the ids we are looking for
// we can't insert the content dynamically, so we tell the browser to open the link directly.
function onDOMError(context) {
  var relaceElMissing = context.relaceElMissing,
      url = context.url;

  // Ideally you should prevent this situation by adding the
  // `no-push-state` CSS class
  // on links to documents that don't match the expected document layout.
  // This only serves as a fallback.

  if (relaceElMissing) {
    if (process.env.DEBUG) {
      var ids = this.replaceIds.concat(this.el.id || []).map(function (x) {
        return '#' + x;
      }).join(', ');
      console.warn('Couldn\'t find one or more ids of \'' + ids + '\' in the document at \'' + window.location + '\'. Opening the link directly.');
    }

    // To open the link directly, we first pop one entry off the browser history.
    // We have to do this because (some) browsers won't handle the back button correctly otherwise.
    // We then wait for a short time and change the document's location.
    // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
    window.history.back();
    setTimeout(function () {
      document.location.href = url;
    }, 100);

    // If it's a different error, throw the generic `error` event.
  } else {
    if (process.env.DEBUG) console.error(context);
    this[_symbols.sFire]('error', { detail: context });
  }
}

// If there is a network error during (pre-) fetching, fire `networkerror` event.
function onNetworkError(context) {
  if (process.env.DEBUG) console.error(context);
  this[_symbols.sFire]('networkerror', { detail: context });
}

// When using the experimental script feature,
// fire `scripterror` event if something goes wrong during script insertion.
function onError(context) {
  if (process.env.DEBUG) console.error(context);
  this[_symbols.sFire]('error', { detail: context });
}

// #### Others
// These event callbacks simply fire an event and pass the context as `detail`.
function onReady(context) {
  this[_symbols.sFire]('ready', { detail: context });
}

function onAfter(context) {
  this[_symbols.sFire]('after', { detail: context });
}

function onProgress(context) {
  this[_symbols.sFire]('progress', { detail: context });
}

function onLoad(context) {
  this[_symbols.sFire]('load', { detail: context });
}

// A compare function for contexts, used in combination with `distinctUntilChanged`.
// We use `cacheNr` as it is a convenient (hacky) way of circumventing
// `distinctUntilChanged` when retrying requests.
var cacheNr = 1;

function compareContext(p, q) {
  return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
}

// Determines if a pair of context's constitutes a hash change (vs. a page chagne)
// We take as a hash change when the pathname of the URLs is the same,
// and the `hash` isn't empty.
function isHashChange(_ref15) {
  var _ref16 = _slicedToArray(_ref15, 2),
      prevPathname = _ref16[0].url.pathname,
      _ref16$ = _ref16[1],
      _ref16$$url = _ref16$.url,
      pathname = _ref16$$url.pathname,
      hash = _ref16$$url.hash,
      type = _ref16$.type;

  return pathname === prevPathname && (type === POP || type === PUSH && hash !== '');
}

// ### Setup observable
// This functions sets up the core observable pipeline of this component.
function setupObservables() {
  var _context9,
      _this5 = this;

  // For now, we take for granted that we have a stream of all `PUSH` events (loading a new page by
  // clicking on a link) and `HINT` events (probable click on a link) which are `pushSubject` and
  // `hintSubject` respectively.
  var pushSubject = new _Subject.Subject();
  var hintSubject = new _Subject.Subject();

  // Emits a value each time the `reload` method is called on this component.
  this[sReload$] = new _Subject.Subject();

  // This is used to reference deferred observaables.
  var ref = {};

  // TODO
  var push$ = (_context9 = (_context9 = _filter.filter.call(pushSubject, isPushEvent.bind(this)), _map3.map).call(_context9, function (event) {
    return {
      type: PUSH,
      url: new _url.URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event: event,
      cacheNr: cacheNr
    };
  }), _do._do).call(_context9, function (_ref17) {
    var event = _ref17.event;

    event.preventDefault();
    saveScrollHistoryState.call(_this5);
  });
  /* *::throttleTime(this.repeatDelay); */

  // In additon to `HINT` and `PUSH` events, there's also `POP` events, which are caused by
  // modifying the browser history, e.g. clicking the back button, etc.
  var pop$ = (_context9 = (_context9 = _fromEvent.fromEvent.call(_Observable.Observable, window, 'popstate'), _filter.filter).call(_context9, function () {
    return window.history.state && window.history.state[histId.call(_this5)];
  }), _map3.map).call(_context9, function (event) {
    return {
      type: POP,
      url: new _url.URL(window.location),
      event: event,
      cacheNr: cacheNr
    };
  });

  // TODO

  var _map = (_context9 = (_context9 = (_context9 = (_context9 = _merge.merge.call(_Observable.Observable, push$, pop$, this[sReload$]),
  // Start with `false`, i.e. we want to prefetch

  // Start with some value so `withLatestFrom` below doesn't "block"
  _startWith.startWith).call(_context9, { url: new _url.URL(window.location) }), _pairwise.pairwise).call(_context9), _share.share).call(_context9), _partition.partition).call(_context9, isHashChange).map(function ($) {
    var _context10;

    return (_context10 = _map3.map.call($, function (_ref18) {
      var _ref19 = _slicedToArray(_ref18, 2),
          x = _ref19[1];

      return x;
    }), _share.share).call(_context10);
  }),
      _map2 = _slicedToArray(_map, 2),
      hash$ = _map2[0],
      page$ = _map2[1];

  // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
  // while a _definitive_ page load is going on => `pauser$` stream.
  // Needs to be deferred b/c of "cyclical" dependency.


  var pauser$ = (_context9 = (_context9 = _defer.defer.call(_Observable.Observable, function () {
    var _context11;

    return (
      // A page change event means we want to pause prefetching, while
      // a response event means we want to resume prefetching.
      _merge.merge.call(_Observable.Observable, _mapTo.mapTo.call(page$, true), (_context11 = ref.fetch$, _mapTo.mapTo).call(_context11, false))
    );
  }), _startWith.startWith).call(_context9, false), _share.share).call(_context9);

  // TODO
  var hint$ = (_context9 = (_context9 = unsubscribeWhen.call(hintSubject, pauser$), _filter.filter).call(_context9, isHintEvent.bind(this)), _map3.map).call(_context9, function (event) {
    return {
      type: HINT,
      url: new _url.URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event: event,
      cacheNr: cacheNr
    };
  });

  // The stream of (pre-)fetch events.
  // Includes definitive page change events do deal with unexpected page changes.
  var prefetch$ = (_context9 = (_context9 = (_context9 = (_context9 = _merge.merge.call(_Observable.Observable, hint$, page$)
  // Don't abort a request if the user "jiggles" over a link
  , _distinctUntilChanged.distinctUntilChanged).call(_context9, compareContext), _switchMap.switchMap).call(_context9, fetchPage.bind(this)), _startWith.startWith).call(_context9, { url: {} }), _share.share).call(_context9);

  // TODO
  ref.fetch$ = (_context9 = (_context9 = (_context9 = (_context9 = _do._do.call(page$, updateHistoryState.bind(this)), _do._do).call(_context9, onStart.bind(this)), _withLatestFrom.withLatestFrom).call(_context9, prefetch$), _switchMap.switchMap).call(_context9, getResponse.bind(this, prefetch$)), _share.share).call(_context9);

  // TODO

  var _ref20 = (_context9 = ref.fetch$, _partition.partition).call(_context9, function (_ref22) {
    var error = _ref22.error;
    return !error;
  }),
      _ref21 = _slicedToArray(_ref20, 2),
      fetchOk$ = _ref21[0],
      fetchError$ = _ref21[1];

  // TODO


  var main$ = (_context9 = (_context9 = (_context9 = (_context9 = (_context9 = (_context9 = (_context9 = _map3.map.call(fetchOk$, responseToContent.bind(this)), _observeOn.observeOn).call(_context9, _animationFrame.animationFrame), _do._do).call(_context9, onReady.bind(this)), _do._do).call(_context9, updateDOM.bind(this)), _do._do).call(_context9, onAfter.bind(this)), _do._do).call(_context9, manageScrollPostion.bind(this)), _do._do).call(_context9, { error: onDOMError.bind(this) }), _catch._catch).call(_context9, function (e, c) {
    return c;
  });

  // If the experimental script feature is enabled,
  // scripts tags have been stripped from the content,
  // and this is where we insert them again.
  if (this._scriptSelector) {
    var _context12;

    main$ = (_context12 = (_context12 = (_context12 = main$, _switchMap.switchMap).call(_context12, reinsertScriptTags.bind(this)), _do._do).call(_context12, { error: onError.bind(this) }), _catch._catch).call(_context12, function (e, c) {
      return c;
    });
  }

  // #### Subscriptions
  // Subscribe to main and hash observables.
  (_context9 = main$, subscribe).call(_context9, onLoad.bind(this));
  subscribe.call(hash$, updateHistoryStateHash.bind(this));

  // Subscribe to the fetch error branch.
  subscribe.call(fetchError$, onNetworkError.bind(this));

  // Fire `progress` event when fetching takes longer than expected.
  (_context9 = _switchMap.switchMap.call(page$, function (context) {
    var _context13;

    return (_context13 = (_context13 = _defer.defer.call(_Observable.Observable, function () {
      return _this5[sAnimPromise];
    }), _takeUntil.takeUntil).call(_context13, ref.fetch$), _mapTo.mapTo).call(_context13, context);
  }), subscribe).call(_context9, onProgress.bind(this));

  // #### Keeping track of links
  // We use a `MutationObserver` to keep track of all the links inside the component,
  // and put events on the `pushSubject` and `hintSubject` observables,
  // but first we need to check if `MutationObserver` is available.
  if ('MutationObserver' in window && 'Set' in window) {
    var _context16;

    // An observable of mutations. The `MutationObserver` will put mutations onto it.
    var mutation$ = new _Subject.Subject();

    // A `Set` of `Element`s.
    // We use this to keep track of which links already have their event listeners registered.
    // TODO: can we guarantee that we won't find the same link twice?
    var links = new _qdSet.Set();

    // Binding `next` functions to their `Subject`s,
    // so that we can pass them as callbacks directly. This is just for convenience.
    var mutationNext = mutation$.next.bind(mutation$);
    var pushNext = pushSubject.next.bind(pushSubject);
    var hintNext = hintSubject.next.bind(hintSubject);

    // We don't use `Observable.fromEvent` here to avoid creating too many observables.
    // Registering an unknown number of event listeners is somewhat debatable,
    // but we certainly don't want to make it wrose.
    // (The number could be brought down by using an `IntersectionObserver` in the future.
    // Also note that typically there will be an animation playing while this is happening,
    // so the effects are not easily noticed).

    // In any case, `MutationObserver` and `Set` help us keep track of which links are children
    // of this component, so that we can reliably add and remove the event listeners.
    // The function to be called for every added node:
    var addListeners = function addListeners(addedNode) {
      if (addedNode instanceof Element) {
        var _context14;

        (_context14 = addedNode.querySelectorAll(_this5.linkSelector), forEach).call(_context14, function (link) {
          if (!links.has(link)) {
            links.add(link);
            link.addEventListener('click', pushNext);
            link.addEventListener('mouseenter', hintNext, { passive: true });
            link.addEventListener('touchstart', hintNext, { passive: true });
            link.addEventListener('focus', hintNext, { passive: true });
          }
        });
      }
    };

    // Next, The function to be called for every removed node.
    // Usually the elments will be removed from the document altogher
    // when they are removed from this component,
    // but since we can't be sure, we remove the event listeners anyway.
    var removeListeners = function removeListeners(removedNode) {
      if (removedNode instanceof Element) {
        var _context15;

        (_context15 = removedNode.querySelectorAll(_this5.linkSelector), forEach).call(_context15, function (link) {
          links.delete(link);
          link.removeEventListener('click', pushNext);
          link.removeEventListener('mouseenter', hintNext, { passive: true });
          link.removeEventListener('touchstart', hintNext, { passive: true });
          link.removeEventListener('focus', hintNext, { passive: true });
        });
      }
    };

    // The mutation observer callback simply puts all mutations on the `mutation$` observable.
    var observer = new MutationObserver(function (mutations) {
      return forEach.call(mutations, mutationNext);
    });

    // For every mutation, we remove the event listeners of elements that go out of the component
    // (if any), and add event listeners for all elements that make it into the compnent (if any).
    (_context16 = unsubscribeWhen.call(mutation$, pauser$), subscribe).call(_context16, function (_ref23) {
      var addedNodes = _ref23.addedNodes,
          removedNodes = _ref23.removedNodes;

      forEach.call(removedNodes, removeListeners.bind(_this5));
      forEach.call(addedNodes, addListeners.bind(_this5));
    });

    // We're interested in nodes entering and leaving the entire subtree of this component,
    // but not attribute changes:
    observer.observe(this.el, { childList: true, subtree: true });

    // The mutation observer does not pick up the links that are already on the page,
    // so we add them manually here, once.
    addListeners.call(this, this.el);

    // If we don't have `MutationObserver` and `Set`, we just register a `click` event listener
    // on the entire component, and check if a click occurred on one of our links.
    // Note that we can't reliably generate hints this way, so we don't.
  } else {
    this.el.addEventListener('click', function (event) {
      var _context17;

      var anchor = (_context17 = event.target, _common.matchesAncestors).call(_context17, _this5.linkSelector);
      if (anchor && anchor.href) {
        event.currentTarget = anchor; // eslint-disable-line no-param-reassign
        pushSubject.next(event);
      }
    });
  }
}

// ## Push state mixin
function pushStateMixin(C) {
  // TODO: see ES6 mixins...
  return function (_componentMixin) {
    _inherits(_class, _componentMixin);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: _symbols.sSetup,


      // ### Setup
      // Overriding the setup function.
      value: function value(el, props) {
        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), _symbols.sSetup, this).call(this, el, props);

        // Setting up scroll restoration
        if ('scrollRestoration' in window.history && this.scrollRestoration) {
          window.history.scrollRestoration = 'manual';
        }

        // If restore the last scroll position, if any.
        restoreScrollPostion.call(this);

        // Remember the current scroll position (for F5/reloads).
        window.addEventListener('beforeunload', saveScrollHistoryState.bind(this));

        // Finally, calling the [setup observables function](#setup-observables) function.
        setupObservables.call(this);

        // Setting the initial `history.state`.
        var url = new _url.URL(window.location);
        updateHistoryState.call(this, { type: INIT, replace: true, url: url });

        // After all this is done, we can fire the one-time `init` event...
        this[_symbols.sFire]('init');

        // ...and our custom `load` event, which gets fired on every page change.
        // We provide similar data as subsequent `load` events,
        // however we can't provide an `anchor` or `event`,
        // since this `load` event wasn't caused by a user interaction.
        onLoad.call(this, {
          type: INIT,
          title: getTitle.call(this, document),
          replaceEls: getReplaceElements.call(this, document),
          url: url,
          cacheNr: cacheNr
        });

        // Allow function chaining.
        return this;
      }
    }, {
      key: _symbols.sSetupDOM,
      value: function value(el) {
        return el;
      }

      // ### Options
      // The default values (and types) of the configuration options (required by hy-component)
      // See [Options](../../options.md) for usage information.

    }, {
      key: 'assign',


      // ### Methods
      // Public methods of this component. See [Methods](../../methods.md) for more.
      value: function assign(url) {
        this[sReload$].next({
          type: PUSH,
          url: new _url.URL(url, window.location),
          cacheNr: ++cacheNr // eslint-disable-line no-plusplus
        });
      }
    }, {
      key: 'reload',
      value: function reload() {
        this[sReload$].next({
          type: PUSH,
          url: new _url.URL(window.location.href),
          cacheNr: ++cacheNr, // eslint-disable-line no-plusplus
          replace: true
        });
      }
    }, {
      key: 'replace',
      value: function replace(url) {
        this[sReload$].next({
          type: PUSH,
          url: new _url.URL(url, window.location),
          cacheNr: ++cacheNr, // eslint-disable-line no-plusplus
          replace: true
        });
      }
    }], [{
      key: 'componentName',

      // The name of the component (required by hy-component)
      get: function get() {
        return 'hy-push-state';
      }
    }, {
      key: 'defaults',
      get: function get() {
        return {
          replaceIds: [],
          linkSelector: 'a[href]:not(.no-push-state)',
          scrollRestoration: false,
          duration: 0,
          _hrefRegex: null,
          _scriptSelector: null
          /* prefetch: true, */
          /* repeatDelay: 500, */
        };
      }
    }, {
      key: 'types',
      get: function get() {
        return {
          replaceIds: _attrTypes.array,
          linkSelector: _attrTypes.string,
          scrollRestoration: _attrTypes.bool,
          duration: _attrTypes.number,
          _hrefRegex: _attrTypes.regex,
          _scriptSelector: _attrTypes.string
          /* prefetch: bool, */
          /* repeatDelay: number, */
        };
      }

      // Modifying options of this component doesn't have side effects (so far).

    }, {
      key: 'sideEffects',
      get: function get() {
        return {};
      }
    }]);

    return _class;
  }((0, _component.componentMixin)(C));
}

// This concludes the implementation of push-state mixin.
// You can now check out
//
// * [vanilla / index.js](../vanilla/index.md)
// * [jquery / index.js](../jquery/index.md)
// * [webcomponent / index.js](../webcomponent/index.md)
//
// to see how it is used.

// [rxjs]: https://github.com/ReactiveX/rxjs
// [esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
// [modernizr]: https://modernizr.com/