// Copyright (C) 2017  Florian Klampfer
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

/*
eslint-disable
import/no-extraneous-dependencies,
import/no-unresolved,
import/extensions
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
import { delay } from 'rxjs/operator/delay';
import { distinctUntilKeyChanged } from 'rxjs/operator/distinctUntilKeyChanged';
import { _do as effect } from 'rxjs/operator/do';
import { filter } from 'rxjs/operator/filter';
import { first } from 'rxjs/operator/first';
import { map } from 'rxjs/operator/map';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { partition } from 'rxjs/operator/partition';
import { share } from 'rxjs/operator/share';
import { startWith } from 'rxjs/operator/startWith';
import { _switch as switchAll } from 'rxjs/operator/switch';
import { switchMap } from 'rxjs/operator/switchMap';
import { takeUntil } from 'rxjs/operator/takeUntil';
import { throttleTime } from 'rxjs/operator/throttleTime';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { zipProto as zipWith } from 'rxjs/operator/zip';

import componentCore from 'y-component/src/component-core';

import {
  shouldLoadAnchor,
  getScrollTop,
  getScrollHeight,
  // expInterval,
  fragmentFromString,
} from '../common';

import { PUSH, HINT, POP } from './kind';

const { forEach: aForEach } = Array.prototype;

// function pauseWith(pauser$) {
//   return this::withLatestFrom(pauser$)
//       ::filter(([, paused]) => paused === false)
//       ::map(([x]) => x);
// }

function pauseWith(pauser$) {
  return pauser$::switchMap(paused => (paused ? Observable::never() : this));
}

DocumentFragment.prototype.getElementById = DocumentFragment.prototype.getElementById ||
  function getElementById(id) { this.querySelector(`#${id}`); };

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
    if (this.replaceIds.length === 0 && !this.el.id) {
      throw Error('No replace ids provided nor does this component have and id');
    }
  }

  setupScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = this.scrollRestoration ? 'manual' : 'auto';
    }

    this.setScrollPosition();
    window.addEventListener('beforeunload', ::this.updateHistoryState);
  }

  cacheTitleElement() {
    this.titleElement = document.querySelector('title') || {};
  }

  bindPushEvents(link$) {
    return this.fromEvents(link$, 'click')
      ::map(event => ({ event, type: PUSH, href: event.currentTarget.href }))
      ::filter(kind => this.isPageChangeEvent(kind))
      ::effect(({ event }) => {
        this.updateHistoryState();
        event.preventDefault();
      });
  }

  bindHintEvents(link$) {
    return Observable::merge(
        this.fromEvents(link$, 'mouseenter'),
        this.fromEvents(link$, 'touchstart'),
        this.fromEvents(link$, 'focus'),
      )
      ::map(event => ({ event, type: HINT, href: event.currentTarget.href }))
      ::filter(kind => this.isPageChangeAnchor(kind));
  }

  bindPopstateEvent() {
    return Observable::fromEvent(window, 'popstate')
      ::map(event => ({ event, type: POP, href: window.location.href }))
      ::filter(() => window.history.state != null);
  }

  linkObservable() {
    return Observable::of(this.el.querySelectorAll(this.linkSelector));
  }

  fromEvents(link$, event) {
    return link$::mergeMap(link => Observable::fromEvent(link, event));
  }

  fetchPage(kind) {
    return Observable::ajax(this.hrefToAjax(kind))
      ::map(({ response }) => Object.assign(kind, { response }))
      ::recover(error => this.recoverIfResponse(kind, error));
      // TODO: make this available via option?
      // .retryWhen(() => Observable.merge(
      //     Observable.fromEvent(window, 'online'),
      //     expInterval(1000, 2))
      //   .do(this.onRetry.bind(this, kind)));
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
      return Observable::of(Object.assign(kind, { response: xhr.response }));
    }

    // else
    return Observable::of(Object.assign(kind, { error }));
  }

  setupObservables() {
    // See `renewEventListeners`
    // TODO: Possible without subjects?
    this.push$$ = new Subject();
    this.hint$$ = new Subject();

    const push$ = this.push$$::switchAll()
      // TODO: This prevents a whole class of concurrency bugs,
      // This is not an issue for fast animations (and prevents accidential double tapping)
      // Ideally the UI is fully repsonsive at all times though..
      // Note that spamming the back/forward button is still possible (only affects `push$`)
      ::throttleTime(this.duration + 100);

    const pop$ = this.bindPopstateEvent();

    // Definitive page change (i.e. either push or pop event)
    this.page$ = Observable::merge(push$, pop$)::share();

    // We don't want to prefetch (i.e. use bandwidth) for a _probabilistic_ page load,
    // while a _definitive_ page load is going on => `pauser$` stream.
    // Needs to be deferred b/c of "cyclical" dependency.
    const pauser$ = Observable::defer(() =>
      Observable::merge(
        // A page change event means we want to pause prefetching
        this.page$::map(() => true),
        // A render complete event means we want to resume prefetching
        this.render$::map(() => false),
      )
        // Start with prefetching
        ::startWith(false),
    );

    // The stream of hint (prefetch) events, possibly paused.
    this.hint$ = this.hint$$::switchAll()::pauseWith(pauser$);

    // The stream of (pre-)fetch events.
    // Includes definitive page change events do deal with unexpected page changes.
    this.prefetch$ = Observable::merge(this.hint$, this.page$)
      ::distinctUntilKeyChanged('href') // Don't abort a request if the user "jiggles" over a link
      ::switchMap(kind => this.fetchPage(kind))
      ::startWith({}) // Start with some value so `withLatestFrom` below doesn't "block"
      ::share();

    const response$ = this.page$
      ::effect(::this.onStart)
      ::withLatestFrom(this.prefetch$)
      ::switchMap(::this.getResponse)
      ::share();

    const [noError$, error$] = response$
      ::partition(({ error }) => error == null);

    this.render$ = noError$
      ::map(::this.responseToContent)
      ::recover((e, caught) => { this.onContentError(e); return caught; })
      ::effect(::this.onReady)
      ::effect(::this.updateDOM)
      ::effect(::this.resetScrollPostion)
      ::effect(::this.onAfter)
      ::recover((e, caught) => { this.onDOMError(e); return caught; })
      // `share`ing the stream between the subscription below and `pauser$`.
      ::share();

    this.render$
      // Renewing event listeners after DOM update/layout/painting is complete
      // HACK: don't use time, use outside observable instead?
      ::debounceTime(this.duration)
      ::effect(::this.renewEventListeners)
      .subscribe();

    // Add script tags one by one
    // This simulates the behavior of a fresh page load
    this.render$
      ::switchMap(::this.reinsertScriptTags)
      ::recover((e, caught) => { this.onScriptError(e); return caught; })
      ::effect(::this.onLoad)
      .subscribe();

    error$
      ::effect(::this.onFetchError)
      .subscribe();

    // Fire `progress` event when fetching takes longer than `this.duration`.
    this.page$
      // HACK: add some time, jtbs
      ::switchMap(() => Observable::timer(this.duration + 200)::takeUntil(response$))
      ::effect(::this.onProgress)
      .subscribe();

    this.onLoad({});

    // Push streams into `push$$` and `hint$$`
    this.renewEventListeners();
  }

  getResponse([kind, prefetch]) {
    let res;

    // Prefetch already complete, use result
    if (kind.href === prefetch.href) {
      res = Observable::of(Object.assign(prefetch, kind));

      if (kind.type === PUSH || !this.noPopDuration) {
        // HACK: add some extra time to prevent 'flickering'
        // ideally, we'd like to take an animation observable as input instead
        res = res::delay(this.duration + 100);
      }
    // Prefetch in progress, use next result (this is why `prefetch$` had to be `share`d)
    } else {
      res = this.prefetch$::first()::map(fetch => Object.assign(fetch, kind));

      if (kind.type === PUSH || !this.noPopDuration) {
        // HACK: add some extra time to prevent 'flickering'
        // ideally, we'd like to take an animation observable as input instead
        res = res::zipWith(Observable::timer(this.duration + 100), x => x);
      }
    }

    return res;
  }

  responseToContent(sponge) {
    const { response } = sponge;

    const documentFragment = fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);

    if (content.some(x => x == null)) {
      throw Object.assign(sponge, { title, content });
    }

    const scripts = this.tempRemoveScriptTags(content);

    return Object.assign(sponge, { title, content, scripts });
  }

  updateDOM(sponge) {
    try {
      const { href, title, content } = sponge;

      if (sponge.type === PUSH) {
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
      docfrag.querySelectorAll(this.scriptSelector)::aForEach((script) => {
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
      Observable::of({})
        ::effect(() => {
          ref.parentNode.insertBefore(script, ref.nextElementSibling);
        });
  }

  reinsertScriptTags(sponge) {
    const { scripts } = sponge;

    if (scripts.length === 0) return Observable::of({});

    return Observable::from(scripts)
      ::concatMap(this.insertScript)
      ::recover((error) => { throw Object.assign(sponge, { error }); });

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
      return this.replaceIds.map(id => documentFragment.getElementById(id));
    }

    return [documentFragment.getElementById(this.el.id)];
  }

  replaceContent(content) {
    if (this.replaceIds.length > 0) {
      this.replaceContentByIds(content);
    } else {
      this.replaceContentWholesale(content);
    }
  }

  replaceContentByIds(elements) {
    this.replaceIds
      .map(id => document.getElementById(id))
      .forEach((oldElement) => {
        oldElement.parentNode.replaceChild(elements.shift(), oldElement);
      });
  }

  replaceContentWholesale([content]) {
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
      if (sponge.type === POP) {
        this.setScrollPosition();
      }
    }
  }

  onStart(sponge) {
    const { href } = sponge;

    if (sponge.type === PUSH) {
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

  onProgress(sponge) {
    this.fireEvent('progress', { detail: sponge });
  }

  onRetry(sponge) {
    this.fireEvent('retry', { detail: sponge });
  }

  onLoad(x) {
    this.fireEvent('load', { detail: x });
  }

  onFetchError(err) {
    this.fireEvent('fetch-error', { detail: err });
  }

  onContentError(err) {
    this.fireEvent('content-error', { detail: err });
  }

  onDOMError(err) {
    this.fireEvent('dom-error', { detail: err });
  }

  onScriptError(err) {
    this.fireEvent('script-error', { detail: err });
  }
};
