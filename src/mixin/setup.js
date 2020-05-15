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

import { Subject, defer, fromEvent, merge, NEVER } from "rxjs/_esm5";

import {
  catchError,
  tap,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  partition,
  pairwise,
  share,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs/_esm5/operators";

import { URL } from "../url";

import { HINT, PUSH, POP } from "./constants";
import { unsubscribeWhen } from "./operators";

import { helperMixin } from "./methods";
import { historyMixin } from "./history";
import { fetchMixin } from "./fetching";
import { updateMixin } from "./update";
import { eventMixin } from "./events";
import { eventListenersMixin } from "./event-listeners";

export const setupObservablesMixin = C =>
  class extends eventListenersMixin(
    eventMixin(updateMixin(fetchMixin(historyMixin(helperMixin(C)))))
  ) {
    // A compare function for contexts, used in combination with `distinctUntilChanged`.
    // We use `cacheNr` as it is a convenient (hacky) way of circumventing
    // `distinctUntilChanged` when retrying requests.
    compareContext(p, q) {
      return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
    }

    // ### Setup observable
    // This functions sets up the core observable pipeline of this component.
    setupObservables() {
      this.cacheNr = 1;

      // For now, we take for granted that we have a stream of all `PUSH` events (loading a new page by
      // clicking on a link) and `HINT` events (probable click on a link) which are `pushSubject` and
      // `hintSubject` respectively.
      this.pushSubject = new Subject();
      this.hintSubject = new Subject();

      // TODO: doc
      const push$ = this.pushSubject.pipe(
        takeUntil(this.subjects.disconnect),
        map(event => ({
          type: PUSH,
          url: new URL(event.currentTarget.href, this.href),
          anchor: event.currentTarget,
          event,
          cacheNr: this.cacheNr,
        })),
        filter(this.isPushEvent.bind(this)),
        tap(({ event }) => {
          event.preventDefault();
          this.saveScrollPosition();
        })
      );

      // In additon to `HINT` and `PUSH` events, there's also `POP` events, which are caused by
      // modifying the browser history, e.g. clicking the back button, etc.
      const pop$ = fromEvent(window, "popstate").pipe(
        takeUntil(this.subjects.disconnect),
        filter(() => window.history.state && window.history.state[this.histId()]),
        map(event => ({
          type: POP,
          url: new URL(window.location, this.href),
          event,
          cacheNr: this.cacheNr,
        }))
      );

      const reload$ = this.reload$.pipe(takeUntil(this.subjects.disconnect));

      // TODO: doc
      const [hash$, page$] = merge(push$, pop$, reload$)
        .pipe(
          startWith({ url: new URL(this.initialHref) }),
          // HACK: make hy-push-state mimic window.location?
          tap(({ url }) => (this._url = url)),
          pairwise(),
          share(),
          partition(this.isHashChange)
        )
        .map(obs$ =>
          obs$.pipe(
            map(([, x]) => x),
            share()
          )
        );

      // TODO: doc
      const hint$ = this.subjects.prefetch.pipe(
        switchMap(prefetch => {
          if (!prefetch) return NEVER;

          // We don't want to prefetch (i.e. use bandwidth) for a _possible_ page load,
          // while a _certain_ page load is going on.
          // The `pauser$` observable let's us achieve this.
          // Needs to be deferred b/c of "cyclical" dependency.
          const pauser$ = defer(() =>
            // A page change event means we want to pause prefetching, while
            // a response event means we want to resume prefetching.
            merge(page$.pipe(mapTo(true)), this.fetch$.pipe(mapTo(false)))
          )
            // Start with `false`, i.e. we want the prefetch pipelien to be active
            .pipe(startWith(false), share());

          return this.hintSubject.pipe(
            takeUntil(this.subjects.disconnect),
            unsubscribeWhen(pauser$),
            map(event => ({
              type: HINT,
              url: new URL(event.currentTarget.href, this.href),
              anchor: event.currentTarget,
              event,
              cacheNr: this.cacheNr,
            })),
            filter(this.isHintEvent.bind(this))
          );
        })
      );

      // The stream of (pre-)fetch events.
      // Includes definitive page change events do deal with unexpected page changes.
      const prefetch$ = merge(hint$, page$).pipe(
        // Don't abort a request if the user "jiggles" over a link
        distinctUntilChanged(this.compareContext.bind(this)),
        switchMap(this.makeRequest.bind(this)),
        // Start with some value so `withLatestFrom` below doesn't "block"
        startWith({ url: {} }),
        share()
      );

      // TODO: doc
      this.fetch$ = page$.pipe(
        tap(context => {
          this.updateHistoryState(context);
          this.onStart(context);
        }),
        withLatestFrom(prefetch$),
        switchMap(this.getResponse.bind(this, prefetch$)),
        share()
      );

      // TODO: doc
      const [fetchOk$, fetchError$] = this.fetch$.pipe(partition(({ error }) => !error));

      // TODO: doc
      const main$ = fetchOk$.pipe(
        map(this.responseToContent.bind(this)),
        tap(context => {
          this.onReady(context);
          this.updateDOM(context);
          this.onAfter(context);
          this.manageScrollPostion(context);
        }),
        tap({ error: e => this.onDOMError(e) }),
        catchError((e, c) => c),

        // If the experimental script feature is enabled,
        // scripts tags have been stripped from the content,
        // and this is where we insert them again.
        switchMap(this.reinsertScriptTags.bind(this)),
        tap({ error: e => this.onError(e) }),
        catchError((e, c) => c)
      );

      // #### Subscriptions
      // Subscribe to main observables.
      main$.subscribe(this.onLoad.bind(this));

      // Subscribe to hash observables.
      hash$.subscribe(context => {
        this.updateHistoryStateHash(context);
        this.manageScrollPostion(context);
      });

      // Subscribe to the fetch error branch.
      fetchError$.subscribe(this.onNetworkError.bind(this));

      // Fire `progress` event when fetching takes longer than expected.
      page$
        .pipe(
          switchMap(context =>
            defer(() => this.animPromise).pipe(takeUntil(this.fetch$), mapTo(context))
          )
        )
        .subscribe(this.onProgress.bind(this));

      // TODO: doc
      this.setupEventListeners();
    }
  };
