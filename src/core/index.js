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

import 'rxjs-es/add/observable/dom/ajax';

import 'rxjs-es/add/operator/catch';
import 'rxjs-es/add/operator/delay';
import 'rxjs-es/add/operator/do';
import 'rxjs-es/add/operator/filter';
import 'rxjs-es/add/operator/map';
import 'rxjs-es/add/operator/mergeAll';
import 'rxjs-es/add/operator/retry';
import 'rxjs-es/add/operator/switch';
import 'rxjs-es/add/operator/switchMap';
import 'rxjs-es/add/operator/materialize';
import 'rxjs-es/add/operator/zip';

import { shouldLoadAnchor, getScrollTop, getScrollHeight } from '../common';

// requirements
// object.assign, queryslector

// window.Observable = Observable;

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
  }

  checkPreCondition() {
    if (this.replaceIds.length === 0) {
      const id = this.eventSource().id;
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
    this.titleElement = document.querySelector('title') || {};
  }

  layPipes() {
    const click$$ = new Subject();

    const pushstate$ = click$$
      .switch()
      .do(() => this.saveScrollPosition())
      .map(href => ({
        push: true,
        href,
      }));

    const popstate$ = Observable.fromEvent(window, 'popstate')
      .filter(() => window.history.state != null)
      .map(() => ({
        push: false,
        href: window.location.href,
      }));

    Observable.merge(pushstate$, popstate$)
      .do(this.onBefore)
      .map(this.hrefToRquestData)
      .switchMap(this.makeRequest)
      .map(this.ajaxResponseToContent)
      .do(this.updateDOM)
      .do(this.onAfter)
      .delay(100) // TODO: make configureable?
      .subscribe(() => {
        click$$.next(this.bindEvents()); // TODO: bind events before adding to DOM?
      });

    // let's get the party started
    click$$.next(this.bindEvents());
  }

  bindCallbacks() {
    this.beNice = this.beNice.bind(this);
    this.hrefToRquestData = this.hrefToRquestData.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
    this.ajaxResponseToContent = this.ajaxResponseToContent.bind(this);
    this.updateDOM = this.updateDOM.bind(this);
    this.onBefore = this.onBefore.bind(this);
    this.onAfter = this.onAfter.bind(this);
  }

  fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
  }

  onBefore() {
    // document.body.classList.add(this.loadingClass);
    this.eventSource().style.willChange = 'content';
    this.fireEvent('before');
  }

  onAfter() {
    // document.body.classList.remove(this.loadingClass);
    this.eventSource().style.willChange = '';
    this.fireEvent('after');
  }

  onError() {
    // document.body.classList.remove(this.loadingClass);
    this.eventSource().style.willChange = '';
    this.fireEvent('error');
  }

  beNice(e) {
    return (
      !e.metaKey &&
      !e.ctrlKey &&
      shouldLoadAnchor(e.currentTarget, this.blacklist, this.hrefRegex)
    );
  }

  bindEvents() {
    return Observable.of(this.eventSource().querySelectorAll(this.linkSelector))
      .map(link => Observable.fromEvent(link, 'click'))
      .mergeAll()
      .filter(this.beNice)
      .do(e => e.preventDefault())
      .map(e => e.currentTarget.href);
  }

  hrefToRquestData(hairball) {
    return Object.assign(hairball, {
      requestData: {
        method: 'GET',
        url: hairball.href,
        responseType: 'text',
      },
    });
  }

  makeRequest(hairball) {
    return minDur.call(
      Observable
        .ajax(hairball.requestData)
        .retry(3)
        .map(ajaxResponse => Object.assign(hairball, { ajaxResponse }))
        .catch((e) => {
          this.onError(e);
          return Observable.empty();
        }),
      this.duration
    );
  }

  getTitleFromDocumentFragment(documentFragment) {
    return (documentFragment.querySelector('title') || {}).textContent;
  }

  getContentFromDocumentFragment(documentFragment) {
    if (this.replaceIds.length > 0) {
      return this.replaceIds.map(id => documentFragment.querySelector(`#${id}`));
    }

    return documentFragment.getElementById(this.eventSource().id);
  }

  ajaxResponseToContent(hairball) {
    const { ajaxResponse: { request: { url }, response } } = hairball;

    const documentFragment = this.fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);

    return Object.assign(hairball, { title, url, content });
  }

  updateDOM({ title, content, url, push }) {
    // update title separately
    // TODO: update meta description?
    this.titleElement.textContent = title;

    // push new frame to history if not a popstate
    if (push) window.history.pushState({}, title, url);

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
    this.eventSource().innerHTML = content.innerHTML;
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
      document.body.style.willChange = 'scroll-position';
      requestAnimationFrame(() => {
        document.body.style.minHeight = `${state.scrollHeight || 0}px`;
        window.scrollTo(window.pageXOffset, state.scrollTop || 0);
        document.body.style.willChange = '';
      });
    }
  }
};
