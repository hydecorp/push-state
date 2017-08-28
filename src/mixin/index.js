// # mixin / index.js
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

import 'core-js/fn/array/for-each';
import 'core-js/fn/function/bind';
import 'core-js/fn/object/assign';

import { componentMixin, setup, fire,
  MODERNIZR_TESTS as COMPONENT_MODERNIZER_TESTS } from 'hy-component/src/component';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { defer } from 'rxjs/observable/defer';
import { from } from 'rxjs/observable/from';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { never } from 'rxjs/observable/never';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';

import { ajax } from 'rxjs/observable/dom/ajax';

import { _catch as recover } from 'rxjs/operator/catch';
import { concatMap } from 'rxjs/operator/concatMap';
// import { debounceTime } from 'rxjs/operator/debounceTime';
// import { delay } from 'rxjs/operator/delay';
// import { delayWhen } from 'rxjs/operator/delayWhen';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { _do as effect } from 'rxjs/operator/do';
import { filter } from 'rxjs/operator/filter';
import { map } from 'rxjs/operator/map';
import { mapTo } from 'rxjs/operator/mapTo';
// import { mergeMap } from 'rxjs/operator/mergeMap';
// import { partition } from 'rxjs/operator/partition';
// import { pairwise } from 'rxjs/operator/pairwise';
import { share } from 'rxjs/operator/share';
import { startWith } from 'rxjs/operator/startWith';
// import { _switch as switchAll } from 'rxjs/operator/switch';
import { switchMap } from 'rxjs/operator/switchMap';
import { take } from 'rxjs/operator/take';
import { takeUntil } from 'rxjs/operator/takeUntil';
// import { throttleTime } from 'rxjs/operator/throttleTime';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { zipProto as zipWith } from 'rxjs/operator/zip';

import '../url';

import {
  fragmentFromString,
  getScrollTop,
  getScrollHeight,
  isExternal,
  isHash,
  matches,
  matchesAncestors,
} from '../common';

// TODO: explain `MODERNIZR_TESTS`
export const MODERNIZR_TESTS = [
  ...COMPONENT_MODERNIZER_TESTS,
  'documentfragment',
  'eventlistener',
  'history',
  'requestanimationframe',
  'queryselector',
];

// TODO: export all symbols, always?
export { setup };

// TODO
const PUSH = 'push';
const HINT = 'hint';
const POP = 'pop';

const DEJITTER = 100;

const { forEach } = Array.prototype;
const assign = ::Object.assign;

DocumentFragment.prototype.getElementById = DocumentFragment.prototype.getElementById ||
  function getElementById(id) { return this.querySelector(`#${id}`); };

function pauseWith(pauser$) {
  if (process.env.DEBUG && !pauser$) throw Error();
  return pauser$::switchMap(paused => (paused ? Observable::never() : this));
}

function waitUntil(observable) {
  return this::zipWith(observable, x => x);
}

function checkPreCondition() {
  if (this.replaceIds.length === 0 && !this.el.id) {
    throw Error('No replace ids provided nor does this component have and id');
  }
}

function setScrollPosition() {
  const state = history.state || {};
  document.body.style.minHeight = `${state.scrollHeight || 0}px`;
  if (state.scrollTop != null) window.scroll(window.pageXOffset, state.scrollTop);
  document.body.style.minHeight = '';
}

function scrollHashIntoView(hash) {
  const el = document.getElementById(hash.substr(1));
  if (el) el.scrollIntoView();
  else window.scroll(window.pageXOffset, 0);
}

function resetScrollPostion({ type, url: { hash } }) {
  if (this.scrollRestoration) {
    if (type === POP) {
      setScrollPosition();
    }
  }

  if (type === PUSH) {
    scrollHashIntoView(hash);
  }
}

function saveScrollPosition(state) {
  return this.scrollRestoration ? assign(state, {
    scrollTop: getScrollTop(),
    scrollHeight: getScrollHeight(),
  }) : state;
}

function updateHistoryState() {
  const state = this::saveScrollPosition(history.state || { id: this.el.id });
  // console.log('replaceState', window.location.href);
  history.replaceState(state, document.title, window.location);
}

function setupScrollRestoration() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = this.scrollRestoration ? 'manual' : 'auto';
  }

  setScrollPosition();
  window.addEventListener('beforeunload', this::updateHistoryState);
}

// URL will only be loaded if it's not an external link, hash, `_blank` target (or similar),
// or blacklisted.
function shouldLoadAnchor(anchor, url, blacklist, hrefRegex) {
  const { target } = anchor;
  return !isExternal(url) && !isHash(url)
    && target === ''
    && !anchor::matches(blacklist)
    && (!hrefRegex || url.href.search(hrefRegex) !== -1);
}

function isPageChangeAnchor({ url, anchor }) {
  return anchor && anchor.href && shouldLoadAnchor(anchor, url, this.blacklist, this.hrefRegex);
}

function isPageChangeEvent(snowball) {
  const { event: { metaKey, ctrlKey } } = snowball;
  return !metaKey && !ctrlKey && this::isPageChangeAnchor(snowball);
}

function hrefToAjax({ url }) {
  return {
    method: 'GET',
    responseType: 'text', // TODO: what was the reason for this again?
    url,
  };
}

function recoverIfResponse(snowball, error) {
  const { status, xhr } = error;

  if (xhr && status && status > 400) {
    // Recover with error page returned from server.
    // NOTE: This assumes error page contains the same ids as the other pages...
    return Observable::of(assign(snowball, { response: xhr.response }));
  }

  // else
  return Observable::of(assign(snowball, { error }));
}

function fetchPage(snowball) {
  return Observable::ajax(hrefToAjax(snowball))
    ::map(({ response }) => assign(snowball, { response }))
    ::recover(error => this::recoverIfResponse(snowball, error));
    // TODO: make this available via option?
    // .retryWhen(() => Observable.merge(
    //     Observable.fromEvent(window, 'online'),
    //     expInterval(1000, 2))
    //   .do(this.onRetry.bind(this, snowball)));
}

function getFetch({ url: { href } }, prefetch, prefetch$) {
  return href === prefetch.url.href ? Observable::of(prefetch) : prefetch$::take(1);
}

function getAnimationDuration() {
  return (/* this.duration === 'manual' ?
    this.ready$ : */
    Observable::timer(this.duration + DEJITTER));
}

function getResponse([snowball, prefetch], prefetch$) {
  return getFetch(snowball, prefetch, prefetch$)
    ::map(fetch => assign(fetch, snowball))
    ::waitUntil(snowball.type === PUSH || !this.instantPop ?
      this::getAnimationDuration() :
      Observable::of(true));
}

function getTitleFromFragment(fragment) {
  return (fragment.querySelector('title') || {}).textContent;
}

function getContentFromFragment(fragment) {
  if (this.replaceIds.length > 0) {
    return this.replaceIds.map(id => fragment.getElementById(id));
  } else {
    return [fragment.getElementById(this.el.id)];
  }
}

function tempRemoveScriptTags(content) {
  const scripts = [];

  content.forEach(docfrag =>
    docfrag.querySelectorAll(this.scriptSelector)::forEach((script) => {
      const pair = [script, script.previousElementSibling];
      script.parentNode.removeChild(script);
      scripts.push(pair);
    }));

  return scripts;
}

function insertScript([script, ref]) {
  return script.src !== '' ?
    Observable.create((observer) => {
      script.addEventListener('load', (x) => {
        observer.next(x);
        observer.complete();
      });

      script.addEventListener('error', (x) => {
        observer.error(x);
      });

      ref.parentNode.insertBefore(script, ref.nextElementSibling);
    }) :
    Observable::of({})
      ::effect(() => {
        ref.parentNode.insertBefore(script, ref.nextElementSibling);
      });
}

function reinsertScriptTags(snowball) {
  const { scripts } = snowball;

  if (scripts.length === 0) return Observable::of({});

  return Observable::from(scripts)
    ::concatMap(insertScript)
    ::recover((error) => { throw assign(snowball, { error }); });

  // TODO: the code below does not guarantee that a script tag has loaded before a `async` one
  // const [script$, asyncScript$] = Observable.from(scripts)
  //   .partition(([script]) => script.async !== '');
  //
  // return Observable.merge(
  //     script$.concatMap(this.insertScript),
  //     asyncScript$.mergeMap(this.insertScript),
  //   );
}

function responseToContent(snowball) {
  const { response } = snowball;

  const fragment = fragmentFromString(response);
  const title = this::getTitleFromFragment(fragment);
  const content = this::getContentFromFragment(fragment);

  if (content.some(x => x == null)) {
    throw assign(snowball, { title, content, someIdMissing: true });
  }

  const scripts = this::tempRemoveScriptTags(content);

  return assign(snowball, { title, content, scripts });
}

function replaceContentByIds(elements) {
  this.replaceIds
    .map(id => document.getElementById(id))
    .forEach((oldElement) => {
      oldElement.parentNode.replaceChild(elements.shift(), oldElement);
    });
}

function replaceContentWholesale([content]) {
  this.el.innerHTML = content.innerHTML;
}

function replaceContent(content) {
  if (this.replaceIds.length > 0) {
    this::replaceContentByIds(content);
  } else {
    this::replaceContentWholesale(content);
  }
}

function updateDOM(snowball) {
  try {
    const { url, title, content } = snowball;

    if (snowball.type === PUSH) {
      // console.log('replaceState', url);
      window.history.replaceState({ id: this.el.id }, title, url);
    }

    document.title = title;
    this::replaceContent(content);
  } catch (error) {
    throw assign(snowball, { error });
  }
}

function onStart(snowball) {
  const { url } = snowball;

  if (snowball.type === PUSH) {
    // console.log('pushState', url);
    window.history.pushState({ id: this.el.id }, '', url);
  }

  this[fire]('start', snowball);
}

function onReady(snowball) {
  this[fire]('ready', snowball);
}

function onAfter(snowball) {
  this[fire]('after', snowball);
}

function onProgress(snowball) {
  this[fire]('progress', snowball);
}

// function onRetry(snowball) {
//   this[fire]('retry', snowball);
// }

function onLoad(x) {
  this[fire]('load', x);
}

// This function handles errors caused while trying to insert the new content into de document.
function onDOMError(err) {
  // If the retrieved documened doesn't contain the ids we are looking for
  // we can't insert the content dynamically, so we tell the browser to open the link directly.
  const { someIdMissing, url } = err;
  if (someIdMissing) {
    // Ideally you should prevent this situation by adding the
    // `no-push-state` CSS class (name can be changed with the `blacklist` option)
    // on links to documents that don't match the expected document layout.
    // This only serves as a fallback.
    const ids = this.replaceIds.concat(this.el.id).map(x => `#${x}`).join(', ');
    console.warn(`Couldn't find one or more ids of '${ids}' in the document at '${window.location}'. Opening the link directly.`);
    console.warn(`NOTE: For a better user experience, make sure the link that caused this matches the blacklist: '${this.blacklist}'.`);
    console.warn("NOTE: In markdown (kramdown), you can add CSS classes like this '[Link](/url){:.no-push-state.another-class'.");

    // To open the link directly, we first pop one entry off the browser history.
    // We have to do this because browsers won't handle the back button otherwise.
    // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
    // Then we wait for the animation to complete, and change the document's location.
    history.back();
    setTimeout(() => { document.location.href = url; }, this.duration);

  // If it's a different error, throw generic `dom-error` event.
  } else {
    console.error(err);
    this[fire]('dom-error', err);
  }
}

function onScriptError(err) {
  console.error(err);
  this[fire]('script-error', err);
}

function setupObservables() {
  const pushSubject = new Subject();
  const hintSubject = new Subject();
  // this.fready$ = new Subject();
  // this.ready$ = this.fready$::share();

  const ref = {};

  const push$ = pushSubject
    ::map(event => ({
      type: PUSH,
      anchor: event.currentTarget,
      url: new URL(event.currentTarget.href),
      event,
    }))
    ::filter(this::isPageChangeEvent)
    ::effect(({ event }) => {
      event.preventDefault();
      this::updateHistoryState();
    });
    // ::throttleTime(this.duration + DEJITTER); // TODO: generalize

  const pop$ = Observable::fromEvent(window, 'popstate')
    ::filter(() => history.state && history.state.id === this.el.id)
    ::map(event => ({
      type: POP,
      url: new URL(window.location),
      event,
    }));

  // Definitive page change (i.e. either push or pop event)
  const page$ = Observable::merge(push$, pop$)
    // ::startWith({ url: new URL(window.location) })
    // ::pairwise()
    // ::filter(([{ url: prevUrl }, { event, url }]) => {
    //   event.preventDefault();
    //   console.log(prevUrl.pathname, url.pathname);
    //   const samePage = prevUrl.pathname === url.pathname;
    //   // HACK: filter shouldn't have side effects, but this is convenient...
    //   // if (samePage) scrollHashIntoView(url.hash);
    //   // We have a pop event if it's not the same page and the history state was pushed by us.
    //   return !samePage && history.state && history.state.id === this.el.id;
    // })
    // ::map(([, x]) => x)
    ::share();

  // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
  // while a _definitive_ page load is going on => `pauser$` stream.
  // Needs to be deferred b/c of "cyclical" dependency.
  const pauser$ = Observable::defer(() =>
      // A page change event means we want to pause prefetching, while
      // a response event means we want to resume prefetching.
      Observable::merge(page$::mapTo(true), ref.response$::mapTo(false)))
    // Start with `false`, i.e. we want to prefetch
    ::startWith(false);

  const hint$ = hintSubject
    ::pauseWith(pauser$)
    ::map(event => ({
      type: HINT,
      anchor: event.currentTarget,
      url: new URL(event.currentTarget.href),
      event,
    }))
    ::filter(this::isPageChangeAnchor);

  // The stream of (pre-)fetch events.
  // Includes definitive page change events do deal with unexpected page changes.
  const prefetch$ = Observable::merge(hint$, page$)
    // Don't abort a request if the user "jiggles" over a link
    ::distinctUntilChanged((p, q) => p.url.href === q.url.href)
    ::switchMap(this::fetchPage)
    // Start with some value so `withLatestFrom` below doesn't "block"
    ::startWith({ url: {} })
    ::share();

  ref.response$ = page$
    ::effect(this::onStart)
    ::withLatestFrom(prefetch$)
    ::switchMap(x => this::getResponse(x, prefetch$))
    // `share`ing the stream between the subscriptions below and `pauser$`.
    ::share();

  // Fire `progress` event when fetching takes longer than expected.
  page$
    ::switchMap(() => this::getAnimationDuration()::takeUntil(ref.response$))
    ::effect(this::onProgress)
    .subscribe();

  ref.response$
    ::map(this::responseToContent)
    ::effect(this::onReady)
    ::effect(this::updateDOM)
    ::effect(this::resetScrollPostion)
    /* ? ::delay(50) */
    ::effect(this::onAfter)
    ::effect({ error: this::onDOMError })
    ::recover((e, c) => c)

    // Add script tags one by one
    // This simulates the behavior of a fresh page load
    ::switchMap(this::reinsertScriptTags)
    ::effect({ error: this::onScriptError })
    ::recover((e, c) => c)
    ::effect(this::onLoad)
    .subscribe();

  // We use a `MutationObserver` to keep track of all the links inside the component,
  // but first we need to check if it is available.
  if ('MutationObserver' in window && 'Set' in window) {
    // An observable of mutations. The `MutationObserver` will put mutations onto it.
    const mutation$ = new Subject();

    // A `Set` of `Element`s.
    // We use this to keep track of which links already have their event listeners registered.
    // TODO: can we guarantee that we won't find the same link twice?
    const set = new Set();

    // Binding the `next` functions to their `Subject`,
    // so that we can pass them as callbacks directly.
    const pushNext = ::pushSubject.next;
    const hintNext = ::hintSubject.next;

    // We don't use `Observable.fromEvent` here to avoid creating too many observables.
    // Registering an unknown number of event listeners is bad enough,
    // so we don't want to make it wrose.
    // The number could be brought down by using an `IntersectionObserver` in the future.
    // Also note that typically there will be an animation playing while this is happening,
    // so the effects are not easily noticed.
    //
    // In any case, the `MutationObserver` and `Set` help us keep track of which links are children
    // of this component, so that we can reliably add and remove the event listeners.
    const addListeners = (addedNode) => {
      addedNode.querySelectorAll(this.linkSelector)::forEach((link) => {
        if (!set.has(link)) {
          set.add(link);
          link.addEventListener('click', pushNext);
          link.addEventListener('mouseenter', hintNext, { passive: true });
          link.addEventListener('touchstart', hintNext, { passive: true });
          link.addEventListener('focus', hintNext, { passive: true });
        }
      });
    };

    // Usually the elments will be removed from the document altogher
    // when they are removed from this component,
    // but since we can't be sure, we remove the event listners anyway.
    const removeListeners = (removedNode) => {
      removedNode.querySelectorAll(this.linkSelector)::forEach((link) => {
        set.delete(link);
        link.removeEventListener('click', pushNext);
        link.removeEventListener('mouseenter', hintNext, { passive: true });
        link.removeEventListener('touchstart', hintNext, { passive: true });
        link.removeEventListener('focus', hintNext, { passive: true });
      });
    };

    // The mutation observer simply puts all mutations on the `mutation$` observable.
    const observer = new MutationObserver(mutations => mutations.forEach(::mutation$.next));

    // For every mutation, we remove the event listeners of elements that go out of the component
    // (if any), and add event listeners for all elements that make it into the compnent (if any).
    mutation$
      ::pauseWith(pauser$)
      ::effect(({ addedNodes, removedNodes }) => {
        removedNodes.forEach(this::removeListeners);
        addedNodes.forEach(this::addListeners);
      })
      ::effect({ error: ::console.error })
      ::recover((e, c) => c)
      .subscribe();

    // We're interested in nodes entering and leaving the entire subtree of this component,
    // but not attribute changes, etc...
    observer.observe(this.el, { childList: true, subtree: true });

    // The mutation observer does not pick up the links that are already on the page,
    // so we add them manually here, once.
    this::addListeners(this.el);

  // If we don't have `MutationObserver` and `Set`, we just register a `click` event listener
  // on the entire component, and check if a click occurred on one of our links.
  // Note that we can't reliably generate hints this way, so we don't.
  } else {
    this.el.addEventListener('click', (event) => {
      const anchor = event.target::matchesAncestors(this.linkSelector);
      if (anchor && anchor.href) {
        event.currentTarget = anchor; // eslint-disable-line no-param-reassign
        pushSubject.next(event);
      }
    });
  }

  // Finally, we fire our custom `load` event.
  this::onLoad({});
}

// main export
export function pushStateMixin(C) {
  return class extends componentMixin(C) {
    static get componentName() { return 'hy-push-state'; }

    static get defaults() {
      return {
        replaceIds: [],
        linkSelector: 'a[href]',
        scriptSelector: 'script',
        scrollRestoration: false,
        hrefRegex: null,
        blacklist: '.no-push-state',
        duration: 0,
        instantPop: true,
        prefetch: true,
      };
    }

    static get sideEffects() {
      return {};
    }

    /* @override */
    [setup](el, props) {
      super[setup](el, props);

      this::checkPreCondition();
      this::setupScrollRestoration();
      this::setupObservables();

      return this;
    }

    // _ready1() {
    //   this.fready$.next(true);
    // }
    //
    // _ready2() {
    //   // this.fready$.next(false);
    // }
  };
}
