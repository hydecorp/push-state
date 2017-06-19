// Copyright (c) 2017 Florian Klampfer
// Licensed under MIT

/*
eslint-disable
import/no-extraneous-dependencies,
import/no-unresolved,
import/extensions,
no-console
*/

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

import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/timer';

import 'rxjs/add/observable/dom/ajax';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/retryWhen';
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

import {
  shouldLoadAnchor,
  getScrollTop,
  getScrollHeight,
  expInterval,
  fragmentFromString,
} from '../common';

import { Push, Hint, Pop } from './kind';

Observable.prototype.pauseWith = function pauseWith(pauser$) {
  return this.withLatestFrom(pauser$)
      .filter(([, paused]) => paused === false)
      .map(([x]) => x);
};

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
      scriptSelector: 'script',
      scrollRestoration: false,
      hrefRegex: null,
      blacklist: '.no-push-state',
      duration: 0,
      noPopDuration: true,
    };
  }

  // @override
  sideEffects() {
    return {};
  }

  // @override
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
        console.warn(`No replace ids provided. Will replace entire content of #${id}`);
      } else {
        throw Error('No replace ids provided nor does this component have and id');
      }
    }
  }

  setupScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = this.scrollRestoration ? 'manual' : 'auto';
    }

    this.setScrollPosition();
    window.addEventListener('beforeunload', this.updateHistoryState.bind(this));
  }

  cacheTitleElement() {
    this.titleElement = document.querySelector('title') || {};
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
    return link$.mergeMap(link => Observable.fromEvent(link, event));
  }

  fetchPage(kind) {
    return Observable
      .ajax(this.hrefToAjax(kind))
      .map(({ response }) => Object.assign(kind, { response }))
      .catch(error => this.recoverIfResponse(kind, error))
      .retryWhen(() => Observable.merge(
          Observable.fromEvent(window, 'online'),
          expInterval(1000, 2))
        .do(this.onRetry.bind(this, kind)));
  }

  hrefToAjax({ href }) {
    return {
      method: 'GET',
      url: href,
      responseType: 'text',
    };
  }

  recoverIfResponse(kind, error) {
    const { status, xhr } = error;

    if (xhr && status && status > 400) {
      // Recover with error page returned from server.
      // NOTE: This assumes error page contains the same ids as the other pages...
      return Observable.of(Object.assign(kind, { response: xhr.response }));
    }

    // else
    this.onError(Object.assign(kind, error));
    return Observable.throw(error);
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
      .throttleTime(this.duration + 100);

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
    this.hint$ = this.hint$$.switch().pauseWith(pauser$);

    // The stream of (pre-)fetch events.
    // Includes definitive page change events do deal with unexpected page changes.
    this.prefetch$ = Observable.merge(this.hint$, this.page$)
      .distinctUntilKeyChanged('href') // Don't abort a request if the user "jiggles" over a link
      .switchMap(kind => this.fetchPage(kind))
      .catch((err, caught) => caught)
      .startWith({}) // Start with some value so `withLatestFrom` below doesn't "block"
      .share();

    this.render$ = this.page$
      .do(this.onStart.bind(this))
      .withLatestFrom(this.prefetch$)
      .switchMap(this.getResponse.bind(this))
      .map(this.responseToContent.bind(this))
      .do(this.onReady.bind(this))
      .do(this.updateDOM.bind(this))
      .do(this.resetScrollPostion.bind(this))
      .do(this.onAfter.bind(this))
      .catch((error, caught) => {
        this.onError(error);
        console.error(error);
        return caught;
      })
      // `share`ing the stream between the subscription below and `pauser$`.
      .share();

    this.render$
      // Renewing event listeners after DOM update/layout/painting is complete
      // HACK: don't use time, use outside observable instead?
      .debounceTime(this.duration)
      .do(this.renewEventListeners.bind(this))
      .subscribe();

    // Add script tags one by one (unless they are marekd `async`)
    // This simulates the behavior of a fresh page load
    this.render$
      .switchMap(this.reinsertScriptTags.bind(this))
      .do(this.onLoad.bind(this))
      .catch((error, caught) => {
        this.onError(error);
        console.error(error);
        return caught;
      })
      .subscribe();

    // Fire `progress` event when fetching takes longer than `this.duration`.
    this.page$
      // HACK: add some time, jtbs
      .switchMap(() => Observable.timer(this.duration + 200)
        .do(this.onAnimationEnd.bind(this))
        .takeUntil(this.render$))
      .do(this.onProgress.bind(this))
      .catch((error, caught) => {
        this.onError(error);
        console.error(error);
        return caught;
      })
      .subscribe();

    // Start pulling values
    this.render$.subscribe();

    this.onLoad({});

    // Push streams into `push$$` and `hint$$`
    this.renewEventListeners();
  }

  getResponse([kind, prefetch]) {
    let res;

    // Prefetch already complete, use result
    if (kind.href === prefetch.href) {
      res = Observable.of(Object.assign(kind, { response: prefetch.response }));

      if (kind instanceof Push || !this.noPopDuration) {
        // HACK: add some extra time to prevent 'flickering'
        // ideally, we'd like to take an animation observable as input instead
        res = res.delay(this.duration + 100);
      }
    // Prefetch in progress, use next result (this is why `prefetch$` had to be `share`d)
    } else {
      res = this.prefetch$.take(1)
        .map(fetch => Object.assign(kind, { response: fetch.response }));

      if (kind instanceof Push || !this.noPopDuration) {
        // HACK: add some extra time to prevent 'flickering'
        // ideally, we'd like to take an animation observable as input instead
        res = res.zip(Observable.timer(this.duration + 100), x => x);
      }
    }

    return res;
  }

  responseToContent(sponge) {
    const { response } = sponge;

    const documentFragment = fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);
    const scripts = this.tempRemoveScriptTags(content);

    return Object.assign(sponge, { title, content, scripts });
  }

  updateDOM(sponge) {
    try {
      const { href, title, content } = sponge;

      if (sponge instanceof Push) {
        window.history.replaceState({ id: this.componentName }, title, href);
      }

      this.titleElement.textContent = title;
      this.replaceContent(content);
    } catch (error) {
      throw Object.assign(sponge, { error });
    }
  }

  tempRemoveScriptTags(content) {
    const scripts = [];

    content.forEach(docfrag =>
      Array.prototype.forEach.call(docfrag.querySelectorAll(this.scriptSelector), (script) => {
        const pair = [script, script.previousElementSibling];
        script.parentNode.removeChild(script);
        scripts.push(pair);
      }));

    return scripts;
  }

  insertScript([script, ref]) {
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
      Observable.of({})
        .do(() => {
          ref.parentNode.insertBefore(script, ref.nextElementSibling);
        });
  }

  reinsertScriptTags({ scripts }) {
    if (scripts.length === 0) return Observable.of({});
    return Observable.from(scripts).concatMap(this.insertScript);

    // TODO: the code below does not guarantee that a script tag has loaded before a `async` one
    // const [script$, asyncScript$] = Observable.from(scripts)
    //   .partition(([script]) => script.async !== '');
    //
    // return Observable.merge(
    //     script$.concatMap(this.insertScript),
    //     asyncScript$.mergeMap(this.insertScript),
    //   );
  }

  renewEventListeners() {
    const link$ = this.linkObservable();
    this.push$$.next(this.bindPushEvents(link$));
    this.hint$$.next(this.bindHintEvents(link$));
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

    return documentFragment.querySelector(`#${this.el.id}`);
  }

  replaceContent(content) {
    if (this.replaceIds.length > 0) {
      this.replaceContentByIds(content);
    } else {
      this.replaceContentWholesale(content);
    }
  }

  replaceContentByIds(elements) {
    const oldElements = this.replaceIds
      .map(id => document.getElementById(id));

    Array.prototype.forEach.call(oldElements, (oldElement) => {
      oldElement.parentNode.replaceChild(elements.shift(), oldElement);
    });
  }

  replaceContentWholesale(content) {
    this.el.innerHTML = content.innerHTML;
  }

  saveScrollPosition(state) {
    return Object.assign(state, {
      scrollTop: getScrollTop(),
      scrollHeight: getScrollHeight(),
    });
  }

  updateHistoryState() {
    let state = history.state || { id: this.componentName };
    state = this.scrollRestoration ? this.saveScrollPosition(state) : state;
    history.replaceState(state, document.title, window.location.href);
  }

  setScrollPosition() {
    const state = history.state || {};
    document.body.style.minHeight = `${state.scrollHeight || 0}px`;
    if (state.scrollTop != null) window.scroll(window.pageXOffset, state.scrollTop);
    document.body.style.minHeight = '';
  }

  resetScrollPostion(sponge) {
    if (this.scrollRestoration) {
      if (sponge instanceof Pop) {
        this.setScrollPosition();
      }
    }
  }

  onStart(sponge) {
    const { href } = sponge;

    if (sponge instanceof Push) {
      window.history.pushState({ id: this.componentName }, '', href);
    }

    this.fireEvent('start', { detail: sponge });
  }

  onReady(sponge) {
    this.fireEvent('ready', { detail: sponge });
  }

  onAfter(sponge) {
    this.fireEvent('after', { detail: sponge });
  }

  onError(err) {
    this.fireEvent('error', { detail: err });
  }

  onProgress(sponge) {
    this.fireEvent('progress', { detail: sponge });
  }

  onRetry(sponge) {
    this.fireEvent('retry', { detail: sponge });
  }

  onAnimationEnd(x) {
    this.fireEvent('animationend', { detail: x });
  }

  onLoad(x) {
    this.fireEvent('load', { detail: x });
  }
};
