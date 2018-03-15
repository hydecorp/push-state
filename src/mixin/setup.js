// # src / mixin / setup.js
// Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
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

import { Observable } from 'rxjs/_esm5/Observable';
import { Subject } from 'rxjs/_esm5/Subject';

// Importing the subset of RxJS functions that we are going to use.
import { defer } from 'rxjs/_esm5/observable/defer';
import { fromEvent } from 'rxjs/_esm5/observable/fromEvent';
import { merge } from 'rxjs/_esm5/observable/merge';

import { ajax } from 'rxjs/_esm5/observable/dom/ajax';

import { animationFrame } from 'rxjs/_esm5/scheduler/animationFrame';

import { catchError } from 'rxjs/_esm5/operators/catchError';
import { tap } from 'rxjs/_esm5/operators/tap';
import { distinctUntilChanged } from 'rxjs/_esm5/operators/distinctUntilChanged';
import { filter } from 'rxjs/_esm5/operators/filter';
import { map } from 'rxjs/_esm5/operators/map';
import { mapTo } from 'rxjs/_esm5/operators/mapTo';
import { observeOn } from 'rxjs/_esm5/operators/observeOn';
import { partition } from 'rxjs/_esm5/operators/partition';
import { pairwise } from 'rxjs/_esm5/operators/pairwise';
import { share } from 'rxjs/_esm5/operators/share';
import { startWith } from 'rxjs/_esm5/operators/startWith';
import { switchMap } from 'rxjs/_esm5/operators/switchMap';
import { takeUntil } from 'rxjs/_esm5/operators/takeUntil';
import { withLatestFrom } from 'rxjs/_esm5/operators/withLatestFrom';

import { matchesAncestors } from '../common';
import { URL } from '../url';

import { unsubscribeWhen } from './operators';
import { HINT, PUSH, POP } from './constants';
import { histId, isPushEvent, isHintEvent, isHashChange } from './methods';
import { manageScrollPostion } from './scrolling';
import { updateHistoryState, updateHistoryStateHash, saveScrollHistoryState } from './history';
import { hrefToAjax, recoverIfResponse, getResponse } from './fetching';
import { reinsertScriptTags } from './script-hack';
import { responseToContent, updateDOM } from './update';

import {
  onStart,
  onDOMError,
  onNetworkError,
  onError,
  onReady,
  onAfter,
  onProgress,
  onLoad,
} from './events';

// For convenience...
const assign = Object.assign.bind(Object);

// A compare function for contexts, used in combination with `distinctUntilChanged`.
// We use `cacheNr` as it is a convenient (hacky) way of circumventing
// `distinctUntilChanged` when retrying requests.
function compareContext(p, q) {
  return p.url.href === q.url.href
    && p.error === q.error
    && p.cacheNr === q.cacheNr;
}

// ### Setup observable
// This functions sets up the core observable pipeline of this component.
export function setupObservables() {
  this.cacheNr = 1;

  // For now, we take for granted that we have a stream of all `PUSH` events (loading a new page by
  // clicking on a link) and `HINT` events (probable click on a link) which are `pushSubject` and
  // `hintSubject` respectively.
  const pushSubject = new Subject();
  const hintSubject = new Subject();

  // This is used to reference deferred observaables.
  const ref = {};

  // TODO: doc
  const push$ = pushSubject.pipe(
    takeUntil(this.teardown$),
    filter(isPushEvent.bind(this)),
    map(event => ({
      type: PUSH,
      url: new URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event,
      cacheNr: this.cacheNr,
    })),
    tap(({ event }) => {
      event.preventDefault();
      saveScrollHistoryState.call(this);
    }),
  );

  // In additon to `HINT` and `PUSH` events, there's also `POP` events, which are caused by
  // modifying the browser history, e.g. clicking the back button, etc.
  const pop$ = fromEvent(window, 'popstate').pipe(
    takeUntil(this.teardown$),
    filter(() => window.history.state && window.history.state[histId.call(this)]),
    map(event => ({
      type: POP,
      url: new URL(window.location),
      event,
      cacheNr: this.cacheNr,
    })),
  );

  const reload$ = this.reload$.pipe(takeUntil(this.teardown$));

  // TODO: doc
  const [hash$, page$] = merge(push$, pop$, reload$).pipe(
    startWith({ url: new URL(window.location) }),
    pairwise(),
    share(),
    partition(isHashChange),
  )
    .map(obs$ => obs$.pipe(
      map(([, x]) => x),
      share(),
    ));

  // We don't want to prefetch (i.e. use bandwidth) for a _possible_ page load,
  // while a _certain_ page load is going on.
  // The `pauser$` observable let's us achieve this.
  // Needs to be deferred b/c of "cyclical" dependency.
  const pauser$ = defer(() =>
    // A page change event means we want to pause prefetching, while
    // a response event means we want to resume prefetching.
    merge(page$.pipe(mapTo(true)), ref.fetch$.pipe(mapTo(false))))
    // Start with `false`, i.e. we want the prefetch pipelien to be active
    .pipe(
      startWith(false),
      share(),
    );

  // TODO: doc
  const hint$ = hintSubject.pipe(
    takeUntil(this.teardown$),
    unsubscribeWhen(pauser$),
    filter(isHintEvent.bind(this)),
    map(event => ({
      type: HINT,
      url: new URL(event.currentTarget.href),
      anchor: event.currentTarget,
      event,
      cacheNr: this.cacheNr,
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

  // TODO: doc
  ref.fetch$ = page$.pipe(
    tap((context) => {
      updateHistoryState.call(this, context);
      onStart.call(this, context);
    }),
    withLatestFrom(prefetch$),
    switchMap(getResponse.bind(this, prefetch$)),
    share(),
  );

  // TODO: doc
  const [fetchOk$, fetchError$] = ref.fetch$.pipe(partition(({ error }) => !error));

  // TODO: doc
  const main$ = fetchOk$.pipe(
    map(responseToContent.bind(this)),
    observeOn(animationFrame),
    tap({
      next: (context) => {
        onReady.call(this, context);
        updateDOM.call(this, context);
        onAfter.call(this, context);
        manageScrollPostion.call(this, context);
      },
      error: e => onDOMError.call(this, e),
    }),
    catchError((e, c) => c),

    // If the experimental script feature is enabled,
    // scripts tags have been stripped from the content,
    // and this is where we insert them again.
    switchMap(reinsertScriptTags.bind(this)),
    tap({ error: e => onError.call(this, e) }),
    catchError((e, c) => c),
  );

  // #### Subscriptions
  // Subscribe to main and hash observables.
  main$.subscribe(onLoad.bind(this));
  hash$.subscribe(updateHistoryStateHash.bind(this));

  // Subscribe to the fetch error branch.
  fetchError$.subscribe(onNetworkError.bind(this));

  // Fire `progress` event when fetching takes longer than expected.
  page$.pipe(switchMap(context =>
    defer(() => this.animPromise).pipe(
      takeUntil(ref.fetch$),
      mapTo(context),
    )))
    .subscribe(onProgress.bind(this));

  // #### Keeping track of links
  // We use a `MutationObserver` to keep track of all the links inside the component,
  // and put events on the `pushSubject` and `hintSubject` observables,
  // but first we need to check if `MutationObserver` is available.
  if ('MutationObserver' in window && 'Set' in window) {
    // A `Set` of `Element`s.
    // We use this to keep track of which links already have their event listeners registered.
    const links = new Set();

    // Binding `next` functions to their `Subject`s,
    // so that we can pass them as callbacks directly. This is just for convenience.
    const pushNext = pushSubject.next.bind(pushSubject);
    const hintNext = hintSubject.next.bind(hintSubject);

    // We don't use `Observable.fromEvent` here to avoid creating too many observables.
    // Registering an unknown number of event listeners is somewhat debatable,
    // but we certainly don't want to make it wrose.
    // (The number could be brought down by using an `IntersectionObserver` in the future.
    // Also note that typically there will be an animation playing while this is happening,
    // so the effects are not easily noticed).
    //
    // In any case, `MutationObserver` and `Set` help us keep track of which links are children
    // of this component, so that we can reliably add and remove the event listeners.
    // The function to be called for every added node:
    const addLink = (link) => {
      if (!links.has(link)) {
        links.add(link);
        link.addEventListener('click', pushNext);
        link.addEventListener('mouseenter', hintNext, { passive: true });
        link.addEventListener('touchstart', hintNext, { passive: true });
        link.addEventListener('focus', hintNext, { passive: true });
      }
    };

    const addListeners = (addedNode) => {
      if (addedNode instanceof Element) {
        Array.from(addedNode.querySelectorAll(this.linkSelector)).forEach(addLink);
      }
    };


    // Next, The function to be called for every removed node.
    // Usually the elments will be removed from the document altogher
    // when they are removed from this component,
    // but since we can't be sure, we remove the event listeners anyway.
    const removeLink = (link) => {
      links.delete(link);
      link.removeEventListener('click', pushNext);
      link.removeEventListener('mouseenter', hintNext, { passive: true });
      link.removeEventListener('touchstart', hintNext, { passive: true });
      link.removeEventListener('focus', hintNext, { passive: true });
    };

    const removeListeners = (removedNode) => {
      if (removedNode instanceof Element) {
        Array.from(removedNode.querySelectorAll(this.linkSelector)).forEach(removeLink);
      }
    };

    // An observable wrapper around the mutation observer.
    // We're only interested in nodes entering and leaving the entire subtree of this component,
    // but not attribute changes.
    Observable.create((obs) => {
      const next = obs.next.bind(obs);
      new MutationObserver(mutations => Array.from(mutations).forEach(next))
        .observe(this.el, { childList: true, subtree: true });
    })
      // No need keep up with the links during the loading phase:
      .pipe(unsubscribeWhen(pauser$))
      // For every mutation, we remove the event listeners of elements that go out of the component
      // (if any), and add event listeners to all elements that make it into the compnent (if any).
      .subscribe(({ addedNodes, removedNodes }) => {
        Array.from(removedNodes).forEach(removeListeners.bind(this));
        Array.from(addedNodes).forEach(addListeners.bind(this));
      });

    // TODO
    this.linkSelector$.subscribe(() => {
      // TODO
      Array.from(links).forEach(removeLink);

      // The mutation observer does not pick up the links that are already on the page,
      // so we add them manually here, once.
      addListeners.call(this, this.el);
    });

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

  // Place initial values on the property observables.
  this.linkSelector$.next(this.linkSelector);
  this.scrollRestoration$.next(this.scrollRestoration);
}
