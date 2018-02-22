// # src / mixin / index.js
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
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/from';
import 'core-js/fn/function/bind';
import 'core-js/fn/object/assign';

// Importing the hy-compontent base libary,
// which helps with making multiple versions of the component (Vanilla JS, WebComponent, etc...).
import { componentMixin, COMPONENT_FEATURE_TESTS } from 'hy-component/src/component';
import { sSetup, sSetupDOM, sFire } from 'hy-component/src/symbols';

import { Observable, Subject } from 'rxjs';

// Importing the subset of RxJS functions that we are going to use.
import { defer } from 'rxjs/observable/defer';
import { from } from 'rxjs/observable/from';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { never } from 'rxjs/observable/never';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';

import { ajax } from 'rxjs/observable/dom/ajax';

import {
  catchError,
  tap,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  // observeOn,
  partition,
  pairwise,
  share,
  startWith,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
  zip,
} from 'rxjs/operators';

// import { animationFrame } from 'rxjs/scheduler/animationFrame';

import { array, bool, number, regex, string } from 'attr-types';
import { Set } from 'qd-set';

// Partial polyfill of the URL class. Only provides the most basic funtionality of `URL`,
// but sufficient for this compoennt.
import { URL } from '../url';

// Some of our own helper functions from [src / common.js](../common.md).
import {
  fragmentFromString,
  getScrollTop,
  getScrollHeight,
  isExternal,
  isHash,
  matchesAncestors,
} from '../common';

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

// We export the setup symbols,
// so that mixin users don't have to import them from hy-compnent separately.
export { sSetup, sSetupDOM };

// These are some 'types' that we use throught the component.
// Going with strings here instead of classes + instanceof / dynamic dispatch for simplicity.
export const INIT = 'init';
export const HINT = 'hint';
export const PUSH = 'push';
export const POP = 'pop';

// If Symbol isn't supported, just use underscore naming convention for private properties.
// We don't need advanced features of Symbol.
const Symbol = global.Symbol || (x => `_${x}`);

// We use `Symbol`s for all internal variables, to avoid naming conflicts when using the mixin.
const sAnimPromise = Symbol('animPromise');
const sReload$ = Symbol('reloadObservable');

// For convenience....
const assign = Object.assign.bind(Object);

// Patching the document fragment's `getElementById` function, which is
// not implemented in all browsers, even some modern ones.
DocumentFragment.prototype.getElementById = DocumentFragment.prototype.getElementById ||
  function getElementById(id) { return this.querySelector(`#${id}`); };

// ## Functions
// What you will notice about the following helper functions is that many make reference to `this`.
// This is because they are invoked with the `::` operator, binding `this` to the component,
// effectively turning them into (private) methods. Since the final export is a mixin,
// we want to avoid potentially conflicting names as much as possible.

// ### Observable extensions
// #### Unsubscribe when
// This operator unsubscribes from the source observable when `pauser$` emits a truthy value,
// and re-subscribes when it emits a falsy value.
const unsubscribeWhen = pauser$ => (source) => {
  if (process.env.DEBUG && !pauser$) throw Error();
  return pauser$.pipe(switchMap(paused => (paused ? never() : source)));
};

// #### Custom subscribe
// A custom subscribe function that will `recover` from an error and log it to the console.
// This is a line of last defense to make sure the entire pipeline/page doesn't crash.
// TODO: maybe just let it crash s.t. the page reloads on the next click on a link!?
// function subscribe(ne, er, co) {
//   let res = this;
//   if (process.env.DEBUG) res = this.pipe(tap({ error: e => console.error(e) }));
//   return res
//     .pipe(catchError((e, c) => c))
//     .subscribe(ne, er, co);
// }

// ### Event filters
function shouldLoadAnchor(anchor, hrefRegex) {
  return anchor && anchor.target === ''
    && (!hrefRegex || anchor.href.search(hrefRegex) !== -1);
}

function isPushEvent({ metaKey, ctrlKey, currentTarget }) {
  return !metaKey && !ctrlKey
    && shouldLoadAnchor(currentTarget, this._hrefRegex)
    && !isExternal(currentTarget);
}

function isHintEvent({ currentTarget }) {
  return shouldLoadAnchor(currentTarget, this._hrefRegex)
    && !isExternal(currentTarget)
    && !isHash(currentTarget);
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
    const el = document.getElementById(hash.substr(1));
    if (el) el.scrollIntoView();
    else if (process.env.DEBUG) console.warn(`Can't find element with id ${hash}`);
  } else window.scroll(window.pageXOffset, 0);
}

// Takes the current history state, and restores the scroll position.
function restoreScrollPostion() {
  const id = histId.call(this); // TODO
  const state = (window.history.state && window.history.state[id]) || {};

  if (state.scrollTop != null) {
    document.body.style.minHeight = state.scrollHeight;
    window.scroll(window.pageXOffset, state.scrollTop);
    /* document.body.style.minHeight = ''; */
  } else if (state.hash) {
    scrollHashIntoView(window.location.hash);
  }
}

// TODO
function manageScrollPostion({ type, url: { hash } }) {
  if (type === PUSH) {
    scrollHashIntoView(hash);
  }

  if (type === POP && this.scrollRestoration) {
    restoreScrollPostion.call(this);
  }
}

function saveScrollPosition(state) {
  const id = histId.call(this);
  return assign(state, {
    [id]: assign(state[id] || {}, {
      scrollTop: getScrollTop(),
      scrollHeight: getScrollHeight(),
    }),
  });
}

function updateHistoryState({ type, replace, url: { href, hash } }) {
  if (type === PUSH || type === INIT) {
    const id = histId.call(this);
    const method = replace || href === window.location.href ? 'replaceState' : 'pushState';
    window.history[method]({ [id]: { hash: !!hash } }, '', href);
  }
}

function updateHistoryStateHash({ type, url }) {
  const { hash, href } = url;

  if (type === PUSH) {
    const id = histId.call(this);
    const currState = assign(window.history.state, {
      [id]: assign(window.history.state[id], { hash: true }),
    });
    const nextState = {
      [id]: { hash: true },
    };
    window.history.replaceState(currState, document.title, window.location.href);
    window.history.pushState(nextState, document.title, href);
  }

  scrollHashIntoView(hash);
}

function saveScrollHistoryState() {
  const state = saveScrollPosition.call(this, window.history.state || {});
  window.history.replaceState(state, document.title, window.location);
}

// ### Fetching
function hrefToAjax({ url }) {
  return {
    method: 'GET',
    responseType: 'text',
    url,
  };
}

// The `ajax` method will throw when it encoutners an a 400+ status code,
// however these are still valid responses from the server, that can be shown using this component.
// This assumes error pages have the same HTML strcuture as the other pages though.
function recoverIfResponse(context, error) {
  const { status, xhr } = error;

  // If we have a response, recover with it and continue with the pipeline.
  if (xhr && xhr.response && status > 400) {
    return of(assign(context, { response: xhr.response }));
  }

  // If we don't have a response, this is an acutal error that should be dealt with.
  return of(assign(context, { error }));
}

// This function returns the request that matches a given URL.
// The way the pipeline is set up, it is either the current `prefetch` value,
// or the next value on the prefetch observable.
// TODO: rename
function getFetch$({ url: { href } }, latestPrefetch, prefetch$) {
  return href === latestPrefetch.url.href && latestPrefetch.error == null ?
    of(latestPrefetch) :
    prefetch$.pipe(take(1));
}

// TODO: rename
function getResponse(prefetch$, [context, latestPrefetch]) {
  return getFetch$(context, latestPrefetch, prefetch$).pipe(
    map(fetch => assign(fetch, context)),
    zip(this[sAnimPromise], x => x),
  );
}

// ### Experimental script feature
// TODO

// This function removes all script tags (as query'ed by `_scriptSelector`) from the response.
function tempRemoveScriptTags(replaceEls) {
  const scripts = [];

  replaceEls.forEach(docfrag =>
    Array.from(docfrag.querySelectorAll(this._scriptSelector)).forEach((script) => {
      const pair = [script, script.previousSibling];
      script.parentNode.removeChild(script);
      scripts.push(pair);
    }));

  return scripts;
}

// Attempts to (synchronously) insert a `script` tag into the DOM, *before* a given `ref` element.
function insertScript([script, ref]) {
  // Temporarily overwrite `document.wirte` to simulate its behavior during the initial load.
  // This only works because scripts are inserted one-at-a-time (via `concatMap`).
  const originalWrite = document.write;

  document.write = (...args) => {
    const temp = document.createElement('div');
    temp.innerHTML = args.join();
    Array.from(temp.childNodes).forEach((node) => {
      ref.parentNode.insertBefore(node, ref.nextSibling);
    });
  };

  // If the script tag needs to fetch its source code, we insert it into the DOM,
  // but we return an observable that only completes once the script has fired its `load` event.
  return script.src !== '' ?
    Observable.create((observer) => {
      script.addEventListener('load', (x) => {
        document.write = originalWrite;
        observer.complete(x);
      });

      script.addEventListener('error', (x) => {
        document.write = originalWrite;
        observer.error(x);
      });

      ref.parentNode.insertBefore(script, ref.nextSibling);
    }) :

    // Otherwise we insert it into the DOM and reset the `document.write` function.
    of({}).pipe(tap(() => {
      ref.parentNode.insertBefore(script, ref.nextSibling);
      document.write = originalWrite;
    }));
}


// Takes a list of `script`--`ref` pairs, and inserts them into the DOM one-by-one.
function reinsertScriptTags(context) {
  const { scripts } = context;

  return from(scripts).pipe(
    concatMap(insertScript),
    catchError((error) => { throw assign(context, { error }); }),
  )
    .toPromise()
    .then(() => context);
}

// ### Content replacement
// TODO
function getTitle(fragment) {
  return (fragment.querySelector('title') || {}).textContent;
}

function getReplaceElements(fragment) {
  if (this.replaceIds.length > 0) {
    return this.replaceIds.map(id => fragment.getElementById(id));
  } else {
    let replaceEl;
    if (this.el.id) {
      replaceEl = fragment.getElementById(this.el.id);
    } else {
      const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
      replaceEl = fragment.querySelectorAll(this.el.tagName)[index];
    }
    return [replaceEl];
  }
}

function responseToContent(context) {
  const { response } = context;

  const fragment = fragmentFromString(response);
  const title = getTitle.call(this, fragment);
  const replaceEls = getReplaceElements.call(this, fragment);

  if (replaceEls.some(x => x == null)) {
    throw assign(context, { relaceElMissing: true });
  }

  const scripts = this._scriptSelector ? tempRemoveScriptTags.call(this, replaceEls) : [];

  return assign(context, { title, replaceEls, scripts });
}

function replaceContentByIds(elements) {
  this.replaceIds
    .map(id => document.getElementById(id))
    .forEach((oldElement, i) => {
      oldElement.parentNode.replaceChild(elements[i], oldElement);
    });
}

function replaceContentWholesale([el]) {
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
    const { title, replaceEls, type } = context;

    document.title = title;

    if (type === PUSH) {
      window.history.replaceState(window.history.state, title, window.location);
    }

    replaceContent.call(this, replaceEls);
  } catch (error) {
    throw assign(context, { error });
  }
}

// ### Event functions
// These functions are called at various points along the observable pipeline to fire events,
// and cause other side effects.

// #### On start
function onStart(context) {
  // By default, hy-push-state will wait at least `duration` ms before replacing the content,
  // so that animations have enough time to finish.
  // The behavior is encoded with a promise that resolves after `duration` ms.
  this[sAnimPromise] = timer(this.duration);

  // The `waitUntil` function lets users of this component override the animation promise.
  // This allows for event-based code execution, rather than timing-based, which prevents hiccups
  // and glitches when, for example, painting takes longer than expected.
  const waitUntil = (promise) => {
    if (process.env.DEBUG && !(promise instanceof Promise || promise instanceof Observable)) {
      console.warn('waitUntil expects a Promise as first argument.');
    }
    this[sAnimPromise] = promise;
  };

  this[sFire]('start', { detail: assign(context, { waitUntil }) });
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
  const { relaceElMissing, url } = context;

  // Ideally you should prevent this situation by adding the
  // `no-push-state` CSS class
  // on links to documents that don't match the expected document layout.
  // This only serves as a fallback.
  if (relaceElMissing) {
    if (process.env.DEBUG) {
      const ids = this.replaceIds.concat(this.el.id || []).map(x => `#${x}`).join(', ');
      console.warn(`Couldn't find one or more ids of '${ids}' in the document at '${window.location}'. Opening the link directly.`);
    }

    // To open the link directly, we first pop one entry off the browser history.
    // We have to do this because (some) browsers won't handle the back button correctly otherwise.
    // We then wait for a short time and change the document's location.
    // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
    window.history.back();
    setTimeout(() => { document.location.href = url; }, 100);

  // If it's a different error, throw the generic `error` event.
  } else {
    if (process.env.DEBUG) console.error(context);
    this[sFire]('error', { detail: context });
  }
}

// If there is a network error during (pre-) fetching, fire `networkerror` event.
function onNetworkError(context) {
  if (process.env.DEBUG) console.error(context);
  this[sFire]('networkerror', { detail: context });
}

// When using the experimental script feature,
// fire `scripterror` event if something goes wrong during script insertion.
function onError(context) {
  if (process.env.DEBUG) console.error(context);
  this[sFire]('error', { detail: context });
}

// #### Others
// These event callbacks simply fire an event and pass the context as `detail`.
function onReady(context) {
  this[sFire]('ready', { detail: context });
}

function onAfter(context) {
  this[sFire]('after', { detail: context });
}

function onProgress(context) {
  this[sFire]('progress', { detail: context });
}

function onLoad(context) {
  this[sFire]('load', { detail: context });
}

// A compare function for contexts, used in combination with `distinctUntilChanged`.
// We use `cacheNr` as it is a convenient (hacky) way of circumventing
// `distinctUntilChanged` when retrying requests.
let cacheNr = 1;

function compareContext(p, q) {
  return p.url.href === q.url.href
    && p.error === q.error
    && p.cacheNr === q.cacheNr;
}

// Determines if a pair of context's constitutes a hash change (vs. a page chagne)
// We take as a hash change when the pathname of the URLs is the same,
// and the `hash` isn't empty.
function isHashChange([
  { url: { pathname: prevPathname } },
  { url: { pathname, hash }, type },
]) {
  return pathname === prevPathname
    && (type === POP || (type === PUSH && hash !== ''));
}


// ### Setup observable
// This functions sets up the core observable pipeline of this component.
function setupObservables() {
  // For now, we take for granted that we have a stream of all `PUSH` events (loading a new page by
  // clicking on a link) and `HINT` events (probable click on a link) which are `pushSubject` and
  // `hintSubject` respectively.
  const pushSubject = new Subject();
  const hintSubject = new Subject();

  // Emits a value each time the `reload` method is called on this component.
  this[sReload$] = new Subject();

  // This is used to reference deferred observaables.
  const ref = {};

  // TODO
  const push$ = pushSubject.pipe(
    filter(isPushEvent.bind(this)),
    map(event => ({
      type: PUSH,
      url: new URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event,
      cacheNr,
    })),
    tap(({ event }) => {
      event.preventDefault();
      saveScrollHistoryState.call(this);
    }),
  );

  // In additon to `HINT` and `PUSH` events, there's also `POP` events, which are caused by
  // modifying the browser history, e.g. clicking the back button, etc.
  const pop$ = fromEvent(window, 'popstate').pipe(
    filter(() => window.history.state && window.history.state[histId.call(this)]),
    map(event => ({
      type: POP,
      url: new URL(window.location),
      event,
      cacheNr,
    })),
  );

  // TODO
  const [hash$, page$] = merge(push$, pop$, this[sReload$]).pipe(
    startWith({ url: new URL(window.location) }),
    pairwise(),
    share(),
    partition(isHashChange),
  )
    .map(obs$ => obs$.pipe(map(([, x]) => x), share()));

  // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
  // while a _definitive_ page load is going on => `pauser$` stream.
  // Needs to be deferred b/c of "cyclical" dependency.
  const pauser$ = defer(() =>
    // A page change event means we want to pause prefetching, while
    // a response event means we want to resume prefetching.
    merge(page$.pipe(mapTo(true)), ref.fetch$.pipe(mapTo(false)))).pipe(
    // Start with `false`, i.e. we want to prefetch
    startWith(false),
    share(),
  );

  // TODO
  const hint$ = hintSubject.pipe(
    unsubscribeWhen(pauser$),
    filter(isHintEvent.bind(this)),
    map(event => ({
      type: HINT,
      url: new URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event,
      cacheNr,
    })),
  );

  // The stream of (pre-)fetch events.
  // Includes definitive page change events do deal with unexpected page changes.
  const prefetch$ = merge(hint$, page$).pipe(
    // Don't abort a request if the user "jiggles" over a link
    distinctUntilChanged(compareContext),
    switchMap(context =>
      ajax(hrefToAjax(context)).pipe(
        map(({ response }) => assign(context, { response })),
        catchError(error => recoverIfResponse.call(this, context, error)),
      )),
    // Start with some value so `withLatestFrom` below doesn't "block"
    startWith({ url: {} }),
    share(),
  );

  // TODO
  ref.fetch$ = page$.pipe(
    tap(updateHistoryState.bind(this)),
    tap(onStart.bind(this)),
    withLatestFrom(prefetch$),
    switchMap(getResponse.bind(this, prefetch$)),
    share(),
  );

  // TODO
  const [fetchOk$, fetchError$] = ref.fetch$.pipe(partition(({ error }) => !error));

  // TODO
  let main$ = fetchOk$.pipe(
    map(responseToContent.bind(this)),
    // observeOn(animationFrame),
    tap(onReady.bind(this)),
    tap(updateDOM.bind(this)),
    tap(onAfter.bind(this)),
    tap(manageScrollPostion.bind(this)),
    tap({ error: e => onDOMError.call(this, e) }),
    catchError((e, c) => c),
  );

  // If the experimental script feature is enabled,
  // scripts tags have been stripped from the content,
  // and this is where we insert them again.
  if (this._scriptSelector) {
    main$ = main$.pipe(
      switchMap(reinsertScriptTags.bind(this)),
      tap({ error: e => onError.call(this, e) }),
      catchError((e, c) => c),
    );
  }

  // #### Subscriptions
  // Subscribe to main and hash observables.
  main$.subscribe(onLoad.bind(this));
  hash$.subscribe(updateHistoryStateHash.bind(this));

  // Subscribe to the fetch error branch.
  fetchError$.subscribe(onNetworkError.bind(this));

  // Fire `progress` event when fetching takes longer than expected.
  page$.pipe(switchMap(context =>
    defer(() => this[sAnimPromise]).pipe(
      takeUntil(ref.fetch$),
      mapTo(context),
    )))
    .subscribe(onProgress.bind(this));

  // #### Keeping track of links
  // We use a `MutationObserver` to keep track of all the links inside the component,
  // and put events on the `pushSubject` and `hintSubject` observables,
  // but first we need to check if `MutationObserver` is available.
  if ('MutationObserver' in window && 'Set' in window) {
    // An observable of mutations. The `MutationObserver` will put mutations onto it.
    const mutation$ = new Subject();

    // A `Set` of `Element`s.
    // We use this to keep track of which links already have their event listeners registered.
    // TODO: can we guarantee that we won't find the same link twice?
    const links = new Set();

    // Binding `next` functions to their `Subject`s,
    // so that we can pass them as callbacks directly. This is just for convenience.
    const mutationNext = mutation$.next.bind(mutation$);
    const pushNext = pushSubject.next.bind(pushSubject);
    const hintNext = hintSubject.next.bind(hintSubject);

    // We don't use `Observable.fromEvent` here to avoid creating too many observables.
    // Registering an unknown number of event listeners is somewhat debatable,
    // but we certainly don't want to make it wrose.
    // (The number could be brought down by using an `IntersectionObserver` in the future.
    // Also note that typically there will be an animation playing while this is happening,
    // so the effects are not easily noticed).

    // In any case, `MutationObserver` and `Set` help us keep track of which links are children
    // of this component, so that we can reliably add and remove the event listeners.
    // The function to be called for every added node:
    const addListeners = (addedNode) => {
      if (addedNode instanceof Element) {
        Array.from(addedNode.querySelectorAll(this.linkSelector)).forEach((link) => {
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
    const removeListeners = (removedNode) => {
      if (removedNode instanceof Element) {
        Array.from(removedNode.querySelectorAll(this.linkSelector)).forEach((link) => {
          links.delete(link);
          link.removeEventListener('click', pushNext);
          link.removeEventListener('mouseenter', hintNext, { passive: true });
          link.removeEventListener('touchstart', hintNext, { passive: true });
          link.removeEventListener('focus', hintNext, { passive: true });
        });
      }
    };

    // The mutation observer callback simply puts all mutations on the `mutation$` observable.
    const observer = new MutationObserver(mutations => Array.from(mutations).forEach(mutationNext));

    // For every mutation, we remove the event listeners of elements that go out of the component
    // (if any), and add event listeners for all elements that make it into the compnent (if any).
    mutation$.pipe(unsubscribeWhen(pauser$))
      .subscribe(({ addedNodes, removedNodes }) => {
        Array.from(removedNodes).forEach(removeListeners.bind(this));
        Array.from(addedNodes).forEach(addListeners.bind(this));
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
    this.el.addEventListener('click', (event) => {
      const anchor = matchesAncestors.call(event.target, this.linkSelector);
      if (anchor && anchor.href) {
        event.currentTarget = anchor; // eslint-disable-line no-param-reassign
        pushSubject.next(event);
      }
    });
  }
}

// ## Push state mixin
export function pushStateMixin(C) {
  // TODO: see ES6 mixins...
  return class extends componentMixin(C) {
    // The name of the component (required by hy-component)
    static get componentName() { return 'hy-push-state'; }

    // ### Setup
    // Overriding the setup function.
    [sSetup](el, props) {
      super[sSetup](el, props);

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
      const url = new URL(window.location);
      updateHistoryState.call(this, { type: INIT, replace: true, url });

      // After all this is done, we can fire the one-time `init` event...
      this[sFire]('init');

      // ...and our custom `load` event, which gets fired on every page change.
      // We provide similar data as subsequent `load` events,
      // however we can't provide an `anchor` or `event`,
      // since this `load` event wasn't caused by a user interaction.
      onLoad.call(this, {
        type: INIT,
        title: getTitle.call(this, document),
        replaceEls: getReplaceElements.call(this, document),
        url,
        cacheNr,
      });

      // Allow function chaining.
      return this;
    }

    [sSetupDOM](el) { return el; }

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
        cacheNr: ++cacheNr, // eslint-disable-line no-plusplus
      });
    }

    reload() {
      this[sReload$].next({
        type: PUSH,
        url: new URL(window.location.href),
        cacheNr: ++cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }

    replace(url) {
      this[sReload$].next({
        type: PUSH,
        url: new URL(url, window.location),
        cacheNr: ++cacheNr, // eslint-disable-line no-plusplus
        replace: true,
      });
    }
  };
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
