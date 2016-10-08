/*
 * Adapted from Miguel Ángel Pérez's smoothState.js
 * https://github.com/miguel-perez/smoothState.js
 *
 * Copyright (c) 2016 Florian Klampfer
 * Licensed under MIT
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import componentCore from 'y-component/src/component-core';

import { Observable } from 'rxjs-es/Observable';
import { Subject } from 'rxjs-es/Subject';

import 'rxjs-es/add/observable/empty';
import 'rxjs-es/add/observable/fromEvent';
import 'rxjs-es/add/observable/merge';
import 'rxjs-es/add/observable/of';
import 'rxjs-es/add/observable/throw';

import 'rxjs-es/add/observable/dom/ajax';

import 'rxjs-es/add/operator/auditTime';
import 'rxjs-es/add/operator/catch';
import 'rxjs-es/add/operator/delay';
import 'rxjs-es/add/operator/distinctUntilChanged';
import 'rxjs-es/add/operator/do';
import 'rxjs-es/add/operator/filter';
import 'rxjs-es/add/operator/map';
import 'rxjs-es/add/operator/mergeAll';
import 'rxjs-es/add/operator/pairwise';
import 'rxjs-es/add/operator/publishLast';
import 'rxjs-es/add/operator/retry';
import 'rxjs-es/add/operator/startWith';
import 'rxjs-es/add/operator/switch';
import 'rxjs-es/add/operator/switchMap';
import 'rxjs-es/add/operator/withLatestFrom';
import 'rxjs-es/add/operator/zip';

import { shouldLoadAnchor, getScrollTop, getScrollHeight, querySelectorInv } from '../common';

// requirements
// object.assign, queryslector

const def = Object.defineProperty.bind(Object);

window.Observable = Observable;

function minDur(time) {
  return this.zip(Observable.of(null).delay(time))
    .map(([$]) => $);
}

// ~ mixin smoothStateCore with componentCore { ...
export default C => class extends componentCore(C) {

  // @override
  componentName() {
    return 'y-smooth-state';
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

  startHistory() {
    this.bindCallbacks();
    this.checkPreCondition();
    this.setupScrollRestoration();
    this.resetScrollPostion();
    this.cacheTitleElement();
    this.layPipes();
    return this;
  }

  bindCallbacks() {
    def(this, 'ajaxResponseToContent', { value: this.ajaxResponseToContent.bind(this) });
    def(this, 'beNice', { value: this.beNice.bind(this) });
    def(this, 'beOkay', { value: this.beOkay.bind(this) });
    def(this, 'hrefToRequestData', { value: this.hrefToRequestData.bind(this) });
    def(this, 'makeRequest', { value: this.makeRequest.bind(this) });
    def(this, 'makePrefetchRequest', { value: this.makePrefetchRequest.bind(this) });
    def(this, 'usePrefechOrMakeRequest', { value: this.usePrefechOrMakeRequest.bind(this) });
    def(this, 'onBefore', { value: this.onBefore.bind(this) });
    def(this, 'onAfter', { value: this.onAfter.bind(this) });
    def(this, 'onError', { value: this.onError.bind(this) });
    def(this, 'updateDOM', { value: this.updateDOM.bind(this) });
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
      if (this.scrollRestoration) history.scrollRestoration = 'manual';
      else history.scrollRestoration = 'auto';
    }

    if (this.scrollRestoration) {
      this.resetScrollPostion();
      window.addEventListener('beforeunload', () => {
        this.saveScrollPosition();
      });
    }
  }

  cacheTitleElement() {
    def(this, 'titleElement', { value: document.querySelector('title') || {} });
  }

  layPipes() {
    const pushstate$ = Observable.fromEvent(this.el, 'click')
      .map(event => ({
        event,
        anchor: querySelectorInv(event.target, this.linkSelector),
      }))
      .filter(this.beNice)
      .do(() => this.saveScrollPosition())
      .do(({ event }) => event.preventDefault())
      .map(({ anchor }) => ({
        push: true,
        href: anchor.href,
      }));

    const popstate$ = Observable.fromEvent(window, 'popstate')
      .filter(() => window.history.state != null)
      .do(event => event.preventDefault())
      .map(() => ({
        push: false,
        href: window.location.href,
      }));

    const prefetchHref$$ = new Subject();
    const prefetch$$ = prefetchHref$$
      .switch()
      // .filter(() => !this.isLoading) // TODO: this works, but isn't so great...
      .distinctUntilChanged() // don't cancel request if user jiggels over link
      .map(href => ({ href }))
      .map(this.hrefToRequestData)
      .map(this.makePrefetchRequest)
      .pairwise()
      .map(([prev, curr]) => {
        if (prev.conn) prev.conn.unsubscribe();
        return curr;
      })
      .startWith({});

    Observable.merge(pushstate$, popstate$)
      .do(this.onBefore)
      .map(this.hrefToRequestData)
      .withLatestFrom(prefetch$$)
      .map(this.usePrefechOrMakeRequest)
      .map(ajax => ajax.catch(this.onError))
      .switch()
      .map(this.ajaxResponseToContent)
      .do(this.updateDOM)
      .do(this.onAfter)
      .subscribe(() => {
        const link$ = this.linkObservable();
        prefetchHref$$.next(this.bindPrefetchEvents(link$));
      });

    const link$ = this.linkObservable();
    prefetchHref$$.next(this.bindPrefetchEvents(link$));
  }

  fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
  }

  onBefore() {
    // this.isLoading = true;
    this.el.style.willChange = 'content';
    document.body.style.willChange = 'scroll-position';
    this.fireEvent('before');
  }

  onAfter() {
    // this.isLoading = false;
    this.el.style.willChange = '';
    document.body.style.willChange = '';
    this.fireEvent('after');
  }

  onError() {
    // this.isLoading = false;
    this.el.style.willChange = '';
    document.body.style.willChange = '';
    this.fireEvent('error');

    return Observable.empty();
  }

  // TODO: rename
  beNice({ event, anchor }) {
    return (
      !event.metaKey &&
      !event.ctrlKey &&
      this.beOkay({ anchor })
    );
  }

  // TODO: rename
  beOkay({ anchor }) {
    return (
      anchor != null &&
      shouldLoadAnchor(anchor, this.blacklist, this.hrefRegex)
    );
  }

  linkObservable() {
    return Observable.of(this.el.querySelectorAll(this.linkSelector));
  }

  bindPrefetchEvents(link$) {
    return Observable.of(
      link$.map(link => Observable.fromEvent(link, 'mouseenter')),
      link$.map(link => Observable.fromEvent(link, 'touchstart')),
      link$.map(link => Observable.fromEvent(link, 'focus'))
    )
      .mergeAll()
      .mergeAll()
      .map(event => ({ anchor: event.currentTarget }))
      .filter(this.beOkay)
      .map(({ anchor }) => anchor.href);
  }

  hrefToRequestData(hairball) {
    return Object.assign(hairball, {
      requestData: {
        method: 'GET',
        url: hairball.href,
        responseType: 'text',
      },
    });
  }

  makeRequest(hairball) {
    const ajax = Observable
      .ajax(hairball.requestData)
      .map(ajaxResponse => Object.assign(hairball, { ajaxResponse }))
      .catch((error) => {
        if (error.status && error.status > 400 && error.xhr) {
          // recover with error page returned from server
          // assuming error page contains the same ids...
          // TODO: maybe parse and check if error page can be swapped and reload otherwise?
          return Observable.of(Object.assign(hairball, { ajaxResponse: error.xhr }));
        }
        return Observable.throw(error);
      });
      // ::minDur(this.duration)
    return minDur.call(ajax, this.duration);
  }

  makePrefetchRequest(hairball) {
    const { href } = hairball;
    const ajax = this.makeRequest(hairball).publishLast();
    const conn = ajax.connect();
    return { href, ajax, conn };
  }

  usePrefechOrMakeRequest([hairball, prefetch]) {
    // prefetch request matches user intent
    if (hairball.href && prefetch.href && hairball.href === prefetch.href) {
      return prefetch.ajax
        // copy properties of original req
        .map(h => Object.assign(h, hairball));
    }
    // current request doesn't match prefetch
    // unsubscribe/cancel prefetch
    if (prefetch.conn) prefetch.conn.unsubscribe();
    // make new, correct request
    return this.makeRequest(hairball);
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

  ajaxResponseToContent(hairball) {
    const { href, ajaxResponse: { response } } = hairball;

    const documentFragment = this.fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);

    return Object.assign(hairball, { title, href, content });
  }

  updateDOM({ title, content, href, push }) {
    // update title separately
    // TODO: update meta description?
    this.titleElement.textContent = title;

    // push new frame to history if not a popstate
    if (push) window.history.pushState({}, title, href);

    this.resetScrollPostion();
    this.replaceContent(content);
  }

  replaceContent(content) {
    if (this.replaceIds.length > 0) {
      this.replaceContentByIds(content);
    } else {
      this.replaceContentWholesale(content);
    }
  }

  // TODO: rename
  checkCondition(oldElements, content) {
    // TODO: replace existing ids, remove missing ides
    if (content.length !== oldElements.length) {
      throw Error("New document doesn't contain the same number of ids");
    }
  }

  replaceContentByIds(content) {
    const oldElements = this.replaceIds
      .map(id => document.getElementById(id));

    this.checkCondition(oldElements, content);

    for (const oldElement of oldElements) {
      oldElement.parentNode.replaceChild(content.shift(), oldElement);
    }
  }

  replaceContentWholesale(content) {
    this.el.innerHTML = content.innerHTML;
  }

  saveScrollPosition() {
    if (this.scrollRestoration) {
      const state = history.state || {};
      state.scrollTop = getScrollTop();
      state.scrollHeight = getScrollHeight();
      history.replaceState(state, document.title, window.location.href);
    }
  }

  resetScrollPostion() {
    if (this.scrollRestoration) {
      const state = history.state || {};
      document.body.style.minHeight = `${state.scrollHeight || 0}px`;
      window.scrollTo(window.pageXOffset, state.scrollTop || 0);
    } else {
      window.scrollTo(window.pageXOffset, 0);
    }
  }
};
