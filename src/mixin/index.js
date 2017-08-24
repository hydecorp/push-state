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
import { debounceTime } from 'rxjs/operator/debounceTime';
// import { delay } from 'rxjs/operator/delay';
// import { delayWhen } from 'rxjs/operator/delayWhen';
import { distinctUntilKeyChanged } from 'rxjs/operator/distinctUntilKeyChanged';
import { _do as effect } from 'rxjs/operator/do';
import { filter } from 'rxjs/operator/filter';
import { map } from 'rxjs/operator/map';
import { mapTo } from 'rxjs/operator/mapTo';
import { mergeMap } from 'rxjs/operator/mergeMap';
// import { partition } from 'rxjs/operator/partition';
import { share } from 'rxjs/operator/share';
import { startWith } from 'rxjs/operator/startWith';
import { _switch as switchAll } from 'rxjs/operator/switch';
import { switchMap } from 'rxjs/operator/switchMap';
import { take } from 'rxjs/operator/take';
import { takeUntil } from 'rxjs/operator/takeUntil';
// import { throttleTime } from 'rxjs/operator/throttleTime';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { zipProto as zipWith } from 'rxjs/operator/zip';

import { shouldLoadAnchor, getScrollTop, getScrollHeight, fragmentFromString } from '../common';

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
  function getElementById(id) { this.querySelector(`#${id}`); };

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

function resetScrollPostion(sponge) {
  if (this.scrollRestoration) {
    if (sponge.type === POP) {
      setScrollPosition();
    }
  }
}

function saveScrollPosition(state) {
  return assign(state, {
    scrollTop: getScrollTop(),
    scrollHeight: getScrollHeight(),
  });
}

function updateHistoryState() {
  let state = history.state || { id: this.componentName };
  state = this.scrollRestoration ? saveScrollPosition(state) : state;
  history.replaceState(state, document.title, window.location.href);
}

function setupScrollRestoration() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = this.scrollRestoration ? 'manual' : 'auto';
  }

  setScrollPosition();
  window.addEventListener('beforeunload', this::updateHistoryState);
}

function cacheTitleElement() {
  this.titleElement = document.querySelector('title') || {};
}

function isPageChangeAnchor({ event: { currentTarget: anchor } }) {
  return (
    anchor != null &&
    shouldLoadAnchor(anchor, this.blacklist, this.hrefRegex)
  );
}

function isPageChangeEvent(kind) {
  const { event } = kind;
  return (
    !event.metaKey &&
    !event.ctrlKey &&
    this::isPageChangeAnchor(kind)
  );
}

function findLinks() {
  return Observable::of(this.el.querySelectorAll(this.linkSelector));
}

// takes an observable of HTML elements and turns them into an observable of `eventName` events
function toEvents(eventName) {
  return this::mergeMap(target => Observable::fromEvent(target, eventName));
}

function bindPushEvents(link$) {
  return link$::toEvents('click')
    ::map(event => ({ event, type: PUSH, href: event.currentTarget.href }))
    ::filter(this::isPageChangeEvent)
    ::effect(({ event }) => {
      event.preventDefault();
      this::updateHistoryState();
    });
}

function bindHintEvents(link$) {
  return Observable::merge(
      link$::toEvents('mouseenter'),
      link$::toEvents('touchstart'),
      link$::toEvents('focus'))
    ::map(event => ({ event, type: HINT, href: event.currentTarget.href }))
    ::filter(this::isPageChangeAnchor);
}

function bindPopstateEvent() {
  return Observable::fromEvent(window, 'popstate')
    ::map(event => ({ event, type: POP, href: window.location.href }))
    ::filter(() => window.history.state != null);
}

function hrefToAjax({ href }) {
  return {
    method: 'GET',
    url: href,
    responseType: 'text',
  };
}

function recoverIfResponse(kind, error) {
  const { status, xhr } = error;

  if (xhr && status && status > 400) {
    // Recover with error page returned from server.
    // NOTE: This assumes error page contains the same ids as the other pages...
    return Observable::of(assign(kind, { response: xhr.response }));
  }

  // else
  return Observable::of(assign(kind, { error }));
}


function fetchPage(kind) {
  return Observable::ajax(hrefToAjax(kind))
    ::map(({ response }) => assign(kind, { response }))
    ::recover(error => this::recoverIfResponse(kind, error));
    // TODO: make this available via option?
    // .retryWhen(() => Observable.merge(
    //     Observable.fromEvent(window, 'online'),
    //     expInterval(1000, 2))
    //   .do(this.onRetry.bind(this, kind)));
}

function getFetch(kind, prefetch, prefetch$) {
  return kind.href === prefetch.href ? Observable::of(prefetch) : prefetch$::take(1);
}

function getAnimationDuration() {
  return this.duration === 'manual' ?
    this.ready$ :
    Observable::timer(this.duration + DEJITTER);
}

function getResponse([kind, prefetch]) {
  return getFetch(kind, prefetch, this.prefetch$)
    ::map(fetch => assign(fetch, kind))
    ::waitUntil(kind.type === PUSH || !this.instantPop ?
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

function reinsertScriptTags(sponge) {
  const { scripts } = sponge;

  if (scripts.length === 0) return Observable::of({});

  return Observable::from(scripts)
    ::concatMap(insertScript)
    ::recover((error) => { throw assign(sponge, { error }); });

  // TODO: the code below does not guarantee that a script tag has loaded before a `async` one
  // const [script$, asyncScript$] = Observable.from(scripts)
  //   .partition(([script]) => script.async !== '');
  //
  // return Observable.merge(
  //     script$.concatMap(this.insertScript),
  //     asyncScript$.mergeMap(this.insertScript),
  //   );
}

function responseToContent(sponge) {
  const { response } = sponge;

  const fragment = fragmentFromString(response);
  const title = this::getTitleFromFragment(fragment);
  const content = this::getContentFromFragment(fragment);

  if (content.some(x => x == null)) {
    throw assign(sponge, { title, content });
  }

  const scripts = this::tempRemoveScriptTags(content);

  return assign(sponge, { title, content, scripts });
}

function bindEvents() {
  const link$ = this::findLinks();
  this.push$$.next(this::bindPushEvents(link$));
  this.hint$$.next(this::bindHintEvents(link$));
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

function updateDOM(sponge) {
  try {
    const { href, title, content } = sponge;

    if (sponge.type === PUSH) {
      window.history.replaceState({ id: this.componentName }, title, href);
    }

    this.titleElement.textContent = title;
    this::replaceContent(content);
  } catch (error) {
    throw assign(sponge, { error });
  }
}

function onStart(sponge) {
  const { href } = sponge;

  if (sponge.type === PUSH) {
    window.history.pushState({ id: this.componentName }, '', href);
  }

  this[fire]('start', sponge);
}

function onReady(sponge) {
  this[fire]('ready', sponge);
}

function onAfter(sponge) {
  this[fire]('after', sponge);
}

function onProgress(sponge) {
  this[fire]('progress', sponge);
}

// function onRetry(sponge) {
//   this[fire]('retry', sponge);
// }

function onLoad(x) {
  this[fire]('load', x);
}

// function onFetchError(err) {
//   this[fire]('fetch-error', err);
// }
//
// function onContentError(err) {
//   this[fire]('content-error', err);
// }

function onDOMError(err) {
  this[fire]('dom-error', err);
}

function onScriptError(err) {
  this[fire]('script-error', err);
}

function setupObservables() {
  // See `bindEvents`
  // TODO: Possible without subjects?
  this.push$$ = new Subject();
  this.hint$$ = new Subject();
  this.fready$ = new Subject();
  this.ready$ = this.fready$::share();

  // // create an observer instance
  // const observer = new MutationObserver((mutations) => {
  //   mutations.forEach((mutation) => {
  //     console.log(mutation);
  //   });
  // });
  //
  // // pass in the target node, as well as the observer options
  // observer.observe(this.el, {
  //   attributes: true,
  //   childList: true,
  //   characterData: true,
  // });

  // later, you can stop observing
  // observer.disconnect();

  const push$ = this.push$$::switchAll();
    // TODO: This prevents a whole class of concurrency bugs,
    // This is not an issue for fast animations (and prevents accidential double tapping)
    // Ideally the UI is fully repsonsive at all times though..
    // Note that spamming the back/forward button is still possible (only affects `push$`)
    // ::throttleTime(this.duration + DEJITTER); // TODO: generalize

  const pop$ = this::bindPopstateEvent();

  // Definitive page change (i.e. either push or pop event)
  this.page$ = Observable::merge(push$, pop$)::share();

  // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
  // while a _definitive_ page load is going on => `pauser$` stream.
  // Needs to be deferred b/c of "cyclical" dependency.
  const pauser$ = Observable::defer(() =>
      Observable::merge(
        // A page change event means we want to pause prefetching
        this.page$::mapTo(true),
        // A render complete event means we want to resume prefetching
        this.render$::mapTo(false)))
    // Start with prefetching
    ::startWith(false);

  // The stream of hint (prefetch) events, possibly paused.
  this.hint$ = this.hint$$::switchAll()::pauseWith(pauser$);

  // The stream of (pre-)fetch events.
  // Includes definitive page change events do deal with unexpected page changes.
  this.prefetch$ = Observable::merge(this.hint$, this.page$)
    // Don't abort a request if the user "jiggles" over a link
    ::distinctUntilKeyChanged('href')
    ::switchMap(this::fetchPage)
    // Start with some value so `withLatestFrom` below doesn't "block"
    ::startWith({})
    ::share();

  this.render$ = this.page$
    ::effect(this::onStart)
    ::withLatestFrom(this.prefetch$)
    ::switchMap(this::getResponse)
    ::map(this::responseToContent)
    ::effect(this::onReady)
    ::effect(this::updateDOM)
    ::effect(this::resetScrollPostion)
    // ::delay(50)
    ::effect(this::onAfter)
    ::recover((e, caught) => { this::onDOMError(e); return caught; })
    // `share`ing the stream between the subscription below and `pauser$`.
    ::share();

  this.render$
    // Renewing event listeners after DOM update/layout/painting is complete
    // HACK: don't use time, use outside observable instead?
    ::debounceTime(500)
    ::effect(this::bindEvents)
    .subscribe();

  // Add script tags one by one
  // This simulates the behavior of a fresh page load
  this.render$
    ::switchMap(this::reinsertScriptTags)
    ::recover((e, caught) => { this::onScriptError(e); return caught; })
    ::effect(this::onLoad)
    .subscribe();

  // Fire `progress` event when fetching takes longer than `this.duration`.
  this.page$
    // HACK: add some time, jtbs
    ::switchMap(() => this::getAnimationDuration()::takeUntil(this.render$))
    ::effect(this::onProgress)
    .subscribe();

  this::onLoad({});

  // Push streams into `push$$` and `hint$$`
  this::bindEvents();
}

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
      this::cacheTitleElement();
      this::setupObservables();

      return this;
    }

    _ready1() {
      this.fready$.next(true);
    }

    _ready2() {
      // this.fready$.next(false);
    }
  };
}
