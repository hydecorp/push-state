/*
 * Adapted from Miguel Ángel Pérez's smoothState.js
 * https://github.com/miguel-perez/smoothState.js
 *
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */
/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

// const JS_FEATURES = [
//   'fn/array/for-each',
//   'fn/function/bind',
//   'fn/number/constructor',
//   'fn/object/assign',
//   'fn/object/define-property',
//   'fn/object/keys',
// ];
//
// const MODERNIZR_TESTS = [
//   'customevent',
//   'documentfragment',
//   'eventlistener',
//   'history',
//   'requestanimationframe',
//   'queryselector',
// ];

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { asap } from 'rxjs/scheduler/asap';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/timer';

import 'rxjs/add/observable/dom/ajax';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/observeOn';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/zip';

import componentCore from 'y-component/src/component-core';

import { shouldLoadAnchor, getScrollTop, getScrollHeight } from '../common';
import { Push, Hint, Pop } from './kind';

const def = Object.defineProperty.bind(Object);

function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}

// ~ mixin pushStateCore with componentCore { ...
export default C => class extends componentCore(C) {

  // @override
  getComponentName() {
    return 'y-push-state';
  }

  // @override
  defaults() {
    return {
      replaceIds: [],
      linkSelector: 'a[href]',
      scrollRestoration: false,
      hrefRegex: null,
      blacklist: null,
      duration: 0,
    };
  }

  // @override
  sideEffects() {
    return {};
  }

  startHistory() {
    this.checkPreCondition();
    this.setupScrollRestoration();
    this.cacheTitleElement();
    this.setupObservables();
    return this;
  }

  checkPreCondition() {
    if (this.replaceIds.length === 0) {
      const id = this.el.id;
      if (id) {
        console.warn(`No replace ids provided. Will replace entire content of #${id}`); // eslint-disable-line no-console
      } else {
        throw Error('No replace ids provided nor does this component have and id'); // eslint-disable-line no-console
      }
    }
  }

  setupScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = this.scrollRestoration ? 'manual' : 'auto';
    }

    if (this.scrollRestoration) {
      this.resetScrollPostion();
      window.addEventListener('beforeunload', () => {
        this.updateHistoryState();
      });
    }
  }

  cacheTitleElement() {
    def(this, 'titleElement', { value: document.querySelector('title') || {} });
  }

  bindPushEvents(link$) {
    return this.fromEvents(link$, 'click')
      .map(event => new Push(event))
      .filter(kind => this.isPageChangeEvent(kind))
      .do(({ event }) => {
        this.updateHistoryState();
        event.preventDefault();
      });
  }

  bindHintEvents(link$) {
    return Observable.merge(
        this.fromEvents(link$, 'mouseenter'),
        this.fromEvents(link$, 'touchstart'),
        this.fromEvents(link$, 'focus'),
      )
      .map(event => new Hint(event))
      .filter(kind => this.isPageChangeAnchor(kind));
  }

  bindPopstateEvent() {
    return Observable.fromEvent(window, 'popstate')
      .map(event => new Pop(event))
      .filter(() => window.history.state != null);
  }

  linkObservable() {
    return Observable.of(this.el.querySelectorAll(this.linkSelector));
  }

  fromEvents(link$, event) {
    return link$.map(link => Observable.fromEvent(link, event)).mergeAll();
  }

  fetchPage(kind) {
    return Observable
      .ajax(this.hrefToAjax(kind))
      .map(({ response }) => Object.assign(kind, { response }))
      .catch(error => this.recoverWhenResponse(kind, error));
  }

  hrefToAjax({ href }) {
    return {
      method: 'GET',
      url: href,
      responseType: 'text',
    };
  }

  recoverWhenResponse(kind, error) {
    const { status, xhr } = error;

    if (xhr && status && status > 400) {
      // Recover with error page returned from server.
      // NOTE: This assumes error page contains the same ids as other pages...
      return Observable.of(Object.assign(kind, { response: xhr.response }));
    }

    return Observable.throw(Object.assign(kind, error));
  }

  setupObservables() {
    // See `renewEventListeners`
    // TODO: Possible without subjects?
    this.push$$ = new Subject();
    this.hint$$ = new Subject();

    const push$ = this.push$$.switch()
      // TODO: This prevents a whole class of concurrency bugs,
      // This is not an issue for fast animations (and prevents accidential double tapping)
      // Ideally the UI is fully repsonsive at all times though..
      // Note that spamming the back/forward button is still possible (only affects `push$`)
      .throttleTime(this.duration);

    const pop$ = this.bindPopstateEvent();

    // Definitive page change (i.e. either push or pop event)
    this.page$ = Observable.merge(push$, pop$).share();

    // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
    // while a _definitive_ page load is going on => `pauser$` stream.
    // Needs to be deferred b/c of "cyclical" dependency.
    const pauser$ = Observable.defer(() =>
      Observable.merge(
        // A page change event means we want to pause prefetching
        this.page$.map(() => true),
        // A render complete event means we want to resume prefetching
        this.render$.map(() => false),
      )
        // Start with prefetching
        .startWith(false),
    );

    // The stream of hint (prefetch) events, possibly paused.
    // Dream syntax (not supported, yet): `this.hint$$.switch().pauseable(pauser$)`
    this.hint$ = this.hint$$.switch()
      .withLatestFrom(pauser$)
      .filter(([, paused]) => paused === false)
      .map(([x]) => x);

    // The stream of (pre-)fetch events.
    // Includes definitive page change events do deal with unexpected page changes.
    const prefetch$ = Observable.merge(this.hint$, this.page$)
      .distinctUntilKeyChanged('href') // Don't abort a request if the user "jiggles" over a link
      .switchMap(kind => this.fetchPage(kind))
      .catch((err, caught) => {
        this.onError(err);
        return caught;
      })
      .startWith({}) // Start with some value so `withLatestFrom` below doesn't "block"
      .share();

    this.render$ = this.page$
      .do(this.onStart.bind(this))
      .observeOn(asap)
      .withLatestFrom(prefetch$)
      .switchMap(([kind, prefetch]) => {
        const timer$ = Observable.timer(this.duration); // .share();

        const response$ = kind.href === prefetch.href ?
            // Prefetch already complete, use result
            Observable.of(Object.assign(kind, { response: prefetch.response })) :
              // .delay(this.duration) :
            // Prefetch in progress, use next result (this is why `prefetch$` had to be `share`d)
            prefetch$.take(1).map(fetch => Object.assign(kind, { response: fetch.response }))
              // .zip(timer$, x => x)
          .share();

        timer$.takeUntil(response$).subscribe(() => this.onProgress(kind));

        return response$;
      })
      .map(this.responseToHTML.bind(this))
      .do(this.onReady.bind(this))
      .observeOn(animationFrame)
      .do(this.updateDOM.bind(this))

      // Renewing event listeners after DOM update/layout/painting is complete
      // TODO: even delay buy `duration` instead?
      .observeOn(asap)
      .do(this.onAfter.bind(this))
      .do(this.renewEventListeners.bind(this))

      // `share`ing the stream between the subscription below and `pauser$`.
      .share();

    // Start pulling values
    this.render$.subscribe();

    // Push streams into `push$$` and `hint$$`
    this.renewEventListeners();
  }

  onStart(sponge) {
    const { href } = sponge;

    if (sponge instanceof Push) {
      window.history.pushState({ id: this.componentName }, '', href);
    }

    this.fireEvent('start', { detail: sponge });
  }

  onProgress(sponge) {
    this.fireEvent('progress', { detail: sponge });
  }

  responseToHTML(sponge) {
    const { response } = sponge;

    const documentFragment = fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);

    return Object.assign(sponge, { title, content });
  }

  onReady(sponge) {
    this.setWillChange();
    this.fireEvent('ready', { detail: sponge });
  }

  updateDOM(sponge) {
    const { href, title, content } = sponge;

    if (sponge instanceof Push) {
      window.history.replaceState({ id: this.componentName }, title, href);
    }

    this.titleElement.textContent = title;
    this.resetScrollPostion();
    this.replaceContent(content);
  }

  onAfter(sponge) {
    this.unsetWillChange();
    this.fireEvent('after', { detail: sponge });
  }

  renewEventListeners() {
    const link$ = this.linkObservable();
    this.push$$.next(this.bindPushEvents(link$));
    this.hint$$.next(this.bindHintEvents(link$));
  }

  onError(err) {
    this.el.style.willChange = '';
    this.fireEvent('error', { detail: err });
  }

  setWillChange() {
    this.el.style.willChange = 'contents';
  }

  unsetWillChange() {
    this.el.style.willChange = '';
  }

  isPageChangeEvent(kind) {
    const { event } = kind;
    return (
      !event.metaKey &&
      !event.ctrlKey &&
      this.isPageChangeAnchor(kind)
    );
  }

  isPageChangeAnchor({ event: { currentTarget: anchor } }) {
    return (
      anchor != null &&
      shouldLoadAnchor(anchor, this.blacklist, this.hrefRegex)
    );
  }

  getTitleFromDocumentFragment(documentFragment) {
    return (documentFragment.querySelector('title') || {}).textContent;
  }

  getContentFromDocumentFragment(documentFragment) {
    if (this.replaceIds.length > 0) {
      return this.replaceIds.map(id => documentFragment.querySelector(`#${id}`));
    }

    return documentFragment.getElementById(this.el.id);
  }

  replaceContent(content) {
    if (this.replaceIds.length > 0) {
      this.replaceContentByIds(content);
    } else {
      this.replaceContentWholesale(content);
    }
  }

  // TODO: Rename
  checkCondition(oldElements, content) {
    // TODO: Just replace existing ids, remove missing ides
    // TODO: Remove in production builds
    if (content.length !== oldElements.length) {
      throw Error("New document doesn't contain the same number of ids");
    }
  }

  replaceContentByIds(elements) {
    const oldElements = this.replaceIds
      .map(id => document.getElementById(id));

    this.checkCondition(oldElements, elements);

    Array.prototype.forEach.call(oldElements, (oldElement) => {
      oldElement.parentNode.replaceChild(elements.shift(), oldElement);
    });
  }

  replaceContentWholesale(content) {
    this.el.innerHTML = content.innerHTML;
  }

  saveScrollPosition(state) {
    if (this.scrollRestoration) {
      return Object.assign(state, {
        scrollTop: getScrollTop(),
        scrollHeight: getScrollHeight(),
      });
    }
    return state;
  }

  updateHistoryState() {
    const state = history.state || { id: this.componentName };
    const stateWithScrollPosition = this.saveScrollPosition(state);
    history.replaceState(stateWithScrollPosition, document.title, window.location.href);
  }

  resetScrollPostion() {
    if (this.scrollRestoration) {
      const state = history.state || {};
      document.body.style.minHeight = `${state.scrollHeight || 0}px`;
      window.scrollTo(window.pageXOffset, state.scrollTop || 0);
    }
  }
};
