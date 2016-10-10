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
// import { asap } from 'rxjs-es/scheduler/asap';

import 'rxjs-es/add/observable/defer';
import 'rxjs-es/add/observable/empty';
import 'rxjs-es/add/observable/fromEvent';
import 'rxjs-es/add/observable/merge';
// import 'rxjs-es/add/observable/never';
import 'rxjs-es/add/observable/of';
import 'rxjs-es/add/observable/throw';

import 'rxjs-es/add/observable/dom/ajax';

// import 'rxjs-es/add/operator/auditTime';
import 'rxjs-es/add/operator/catch';
// import 'rxjs-es/add/operator/concat';
// import 'rxjs-es/add/operator/combineLatest';
import 'rxjs-es/add/operator/delay';
// import 'rxjs-es/add/operator/distinctUntilChanged';
import 'rxjs-es/add/operator/distinctUntilKeyChanged';
import 'rxjs-es/add/operator/do';
import 'rxjs-es/add/operator/filter';
import 'rxjs-es/add/operator/map';
// import 'rxjs-es/add/operator/mapTo';
import 'rxjs-es/add/operator/merge';
import 'rxjs-es/add/operator/mergeAll';
// import 'rxjs-es/add/operator/pairwise';
// import 'rxjs-es/add/operator/publish';
// import 'rxjs-es/add/operator/publishLast';
// import 'rxjs-es/add/operator/repeat';
// import 'rxjs-es/add/operator/retry';
import 'rxjs-es/add/operator/share';
// import 'rxjs-es/add/operator/skipUntil';
import 'rxjs-es/add/operator/startWith';
// import 'rxjs-es/add/operator/subscribeOn';
import 'rxjs-es/add/operator/switch';
import 'rxjs-es/add/operator/switchMap';
import 'rxjs-es/add/operator/take';
// import 'rxjs-es/add/operator/takeUntil';
import 'rxjs-es/add/operator/withLatestFrom';
import 'rxjs-es/add/operator/zip';

import { shouldLoadAnchor, getScrollTop, getScrollHeight } from '../common';

// requirements
// object.assign, queryslector

const def = Object.defineProperty.bind(Object);

window.Observable = Observable;

function minDur(time) {
  return this.zip(Observable.of(null).delay(time))
    .map(([$]) => $);
}

class Kind {
  constructor(event) {
    this.event = event;
  }
}
class Push extends Kind {
  constructor(event) {
    super(event);
    this.href = event.currentTarget.href;
  }
}
class Hint extends Kind {
  constructor(event) {
    super(event);
    this.href = event.currentTarget.href;
  }
}
class Pop extends Kind {
  constructor(event) {
    super(event);
    this.href = window.location.href;
  }
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
    def(this, 'fetchPage', { value: this.fetchPage.bind(this) });
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

  bindPushEvents(link$) {
    return Observable.defer(() => this.fromEvent(link$, 'click'))
      .mergeAll()
      .map(event => new Push(event))
      .filter(({ event }) => this.beNice(event))
      .do(({ event }) => {
        this.saveScrollPosition();
        event.preventDefault();
      });
  }

  bindHintEvents(link$) {
    return Observable.defer(() => Observable.empty()
      .merge(this.fromEvent(link$, 'mouseenter'))
      .merge(this.fromEvent(link$, 'touchstart'))
      .merge(this.fromEvent(link$, 'focus'))
    )
      .mergeAll()
      .map(event => new Hint(event))
      .filter(({ event }) => this.beOkay(event));
  }

  bindPopstateEvent() {
    return Observable.fromEvent(window, 'popstate')
      .map(event => new Pop(event))
      .filter(() => window.history.state != null);
  }

  linkObservable() {
    return Observable.of(this.el.querySelectorAll(this.linkSelector));
  }

  fromEvent(link$, event) {
    return link$.map(link => Observable.fromEvent(link, event));
  }

  fetchPage(kind) {
    const requestData = this.hrefToRequestData(kind);

    const ajax$ = Observable
      .ajax(requestData)
      .map(({ response }) => Object.assign(kind, { response }))
      .catch(error => this.recoverIfPossible(kind, error));

    return minDur.call(ajax$, this.duration);
  }

  hrefToRequestData({ href }) {
    return {
      method: 'GET',
      url: href,
      responseType: 'text',
    };
  }

  recoverIfPossible(kind, error) {
    const { status, xhr } = error;

    if (status && status > 400 && xhr) {
      // recover with error page returned from server
      // assuming error page contains the same ids...
      // TODO: maybe parse and check if error page can be swapped and reload otherwise?
      return Observable.of(Object.assign(kind, { response: xhr.response }));
    }

    // TODO: don't throw here?
    return Observable.throw(error);
  }

  layPipes() {
    this.push$$ = new Subject();
    this.hint$$ = new Subject();

    const push$ = this.push$$.switch();
    const pop$ = this.bindPopstateEvent();

    this.page$ = Observable.merge(push$, pop$);

    const pauser$ = Observable.defer(() =>
      Observable.merge(
        this.page$.map(() => true),
        this.render$.map(() => false)
      ).startWith(false)
    );

    this.hint$ = this.hint$$.switch()
      .withLatestFrom(pauser$)
      .switchMap(([hint, paused]) => (paused ?
        Observable.empty() :
        Observable.of(hint))
      );

    // Dream syntax:
    // this.hint$$.switch().pauseable(pauser$);

    const prefetch$ = Observable.merge(this.hint$, this.page$)
      .distinctUntilKeyChanged('href')
      .switchMap(this.fetchPage)
      .startWith({})
      .share();

    this.render$ = this.page$
      .do(this.onBefore)
      .withLatestFrom(prefetch$)
      .switchMap(([kind, prefetch]) => (kind.href === prefetch.href ?
        // Case 1.1: Prefetch already complete, use result
        Observable.of([kind, prefetch]) :
        // Case 1.2: Prefetch in progress, use next result
        prefetch$.take(1).map(fetch => [kind, fetch])
      ))
      .do(([kind, prefetch]) => {
        // try {
        this.updateDOM(kind, prefetch);
        this.onAfter();
        this.renewEventListeners();
        // } catch (e) {
        //   this.onError(e);
        // }
      })
      .share();

    this.render$.subscribe(() => {});

    this.renewEventListeners();
  }

  renewEventListeners() {
    const link$ = this.linkObservable();
    this.push$$.next(this.bindPushEvents(link$));
    this.hint$$.next(this.bindHintEvents(link$));
  }

  updateDOM(kind, { response }) {
    const { href } = kind;
    const { title, content } = this.responseToHTML(response);

    if (kind instanceof Push) {
      window.history.pushState({ id: 'y-smooth-state' }, title, href);
    }

    this.titleElement.textContent = title;
    this.resetScrollPostion();
    this.replaceContent(content);
  }

  responseToHTML(response) {
    const documentFragment = this.fragmentFromString(response);
    const title = this.getTitleFromDocumentFragment(documentFragment);
    const content = this.getContentFromDocumentFragment(documentFragment);
    return { title, content };
  }

  fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
  }

  onBefore() {
    // this.pauser$.next(true);
    this.el.style.willChange = 'content';
    document.body.style.willChange = 'scroll-position';
    this.fireEvent('before');
  }

  onAfter() {
    // this.pauser$.next(false);
    this.el.style.willChange = '';
    document.body.style.willChange = '';
    this.fireEvent('after');
  }

  onError() {
    // this.pauser$.next(false);
    this.el.style.willChange = '';
    document.body.style.willChange = '';
    this.fireEvent('error');

    return Observable.empty();
  }

  // TODO: rename
  beNice(event) {
    return (
      !event.metaKey &&
      !event.ctrlKey &&
      this.beOkay(event)
    );
  }

  // TODO: rename
  beOkay(event) {
    const anchor = event.currentTarget;
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
