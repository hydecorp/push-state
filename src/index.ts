/** 
 * Copyright (c) 2020 Florian Klampfer <https://qwtel.com/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * @license 
 * @nocompile
 */
import { property, customElement } from 'lit-element';

import { Observable, Subject, BehaviorSubject, merge, defer, fromEvent, animationFrameScheduler } from "rxjs";
import { map, filter, tap, takeUntil, startWith, pairwise, share, mapTo, switchMap, distinctUntilChanged, withLatestFrom, catchError, observeOn } from 'rxjs/operators';

import { RxLitElement, createResolvablePromise, matchesAncestors } from '@hydecorp/component';

import { applyMixins, Context, Cause, ClickContext, isPushEvent, isHashChange, isHintEvent, filterWhen, isExternal } from './common';

import { FetchManager, ResponseContext, ResponseContextErr, ResponseContextOk } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';

function compareContext(p: Context, q: Context) {
  return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
}

@customElement('hy-push-state')
export class HyPushState
  extends applyMixins(RxLitElement, [EventListenersMixin])
  implements Location, EventListenersMixin {

  el: HTMLElement = this

  createRenderRoot() { return this }

  @property({ type: String, reflect: true, attribute: 'replace-selector' }) replaceSelector?: string;
  @property({ type: String, reflect: true, attribute: 'link-selector' }) linkSelector: string = "a[href]:not([data-no-push])";
  @property({ type: String, reflect: true, attribute: 'script-selector' }) scriptSelector?: string;
  @property({ type: Boolean, reflect: true }) prefetch: boolean = false;
  @property({ type: Number, reflect: true }) duration: number = 0;
  // @property({ type: Boolean, reflect: true, attribute: 'simulate-load' }) simulateLoad: boolean = false;
  @property({ type: Boolean, reflect: true, attribute: 'hashchange' }) simulateHashChange: boolean = false;

  @property({ type: String }) baseURL: string = window.location.href;

  #initialized = createResolvablePromise();
  get initialized() {
    return this.#initialized;
  }

  $!: {
    linkSelector: Subject<string>;
    prefetch: Subject<boolean>;
  };

  animPromise: Promise<any> = Promise.resolve(null);
  fadePromise: Promise<any> = Promise.resolve(null);

  #scrollManager = new ScrollManager(this);
  #historyManager = new HistoryManager(this);
  #fetchManager = new FetchManager(this);
  #updateManager = new UpdateManager(this);
  #eventManager = new EventManager(this);

  #url = new URL(this.baseURL)

  #setLocation = (key: 'hash' | 'host' | 'hostname' | 'href' | 'pathname' | 'port' | 'protocol' | 'search', value: string) => {
    const u = new URL(this.#url.href);
    u[key] = value;
    this.assign(u.href);
  }

  // Implement Location
  get hash() { return this.#url.hash }
  get host() { return this.#url.host }
  get hostname() { return this.#url.hostname }
  get href() { return this.#url.href }
  get pathname() { return this.#url.pathname }
  get port() { return this.#url.port }
  get protocol() { return this.#url.protocol }
  get search() { return this.#url.search }
  get origin() { return this.#url.origin }
  get ancestorOrigins() { return window.location.ancestorOrigins }

  set hash(value) { this.#setLocation('hash', value) }
  set host(value) { this.#setLocation('host', value) }
  set hostname(value) { this.#setLocation('hostname', value) }
  set href(value) { this.#setLocation('href', value) }
  set pathname(value) { this.#setLocation('pathname', value) }
  set port(value) { this.#setLocation('port', value) }
  set protocol(value) { this.#setLocation('protocol', value) }
  set search(value) { this.#setLocation('search', value) }

  // EventListenersMixin
  setupEventListeners!: () => {
    pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
    hintEvent$: Observable<[Event, HTMLAnchorElement]>;
  };

  #cacheNr = 0;

  get histId() { return this.id || this.tagName }

  #reload$ = new Subject<Context>();

  @property()
  assign(url: string) {
    this.#reload$.next({
      cause: Cause.Push,
      url: new URL(url, this.href),
      cacheNr: ++this.#cacheNr,
    });
  }

  @property()
  reload() {
    this.#reload$.next({
      cause: Cause.Push,
      url: new URL(this.href),
      cacheNr: ++this.#cacheNr,
      replace: true,
    });
  }

  @property()
  replace(url: string) {
    this.#reload$.next({
      cause: Cause.Push,
      url: new URL(url, this.href),
      cacheNr: ++this.#cacheNr,
      replace: true,
    });
  }

  connectedCallback() {
    super.connectedCallback()

    this.$ = {
      linkSelector: new BehaviorSubject(this.linkSelector),
      prefetch: new BehaviorSubject(this.prefetch),
    };

    // Remember the current scroll position (for F5/reloads).
    window.addEventListener("beforeunload", this.#historyManager.updateHistoryScrollPosition);

    // Remember scroll position for backward/forward navigation cache.
    // Technically, this is only necessary for Safari, because other browsers will not use the BFN cache
    // when a beforeunload event is registered...
    document.documentElement.addEventListener('click', this.#updateHistoryScrollPosition)

    this.updateComplete.then(this.#upgrade)
  }

  #updateHistoryScrollPosition = (event: MouseEvent) => {
    const anchor = matchesAncestors(event.target as Element, 'a[href]') as HTMLAnchorElement | null;
    if (isExternal(anchor)) {
      this.#historyManager.updateHistoryScrollPosition();
    }
  }

  #response$!: Observable<ResponseContext>

  #upgrade = () => {
    const { pushEvent$, hintEvent$ } = this.setupEventListeners();

    const push$: Observable<ClickContext> = pushEvent$.pipe(
      // takeUntil(this.subjects.disconnect),
      map(([event, anchor]) => ({
        cause: Cause.Push,
        url: new URL(anchor.href, this.href),
        anchor,
        event,
        cacheNr: this.#cacheNr,
      })),
      filter(x => isPushEvent(x, this)),
      tap(({ event }) => {
        event.preventDefault();
        this.#historyManager.updateHistoryScrollPosition();
      })
    );

    const pop$: Observable<Context> = fromEvent(window, "popstate").pipe(
      // takeUntil(this.subjects.disconnect),
      filter(() => window.history.state && window.history.state[this.histId]),
      map(event => ({
        cause: Cause.Pop,
        url: new URL(window.location.href),
        cacheNr: this.#cacheNr,
        event,
      }))
    );

    const reload$ = this.#reload$; // .pipe(takeUntil(this.subjects.disconnect));

    const merged$: Observable<Context> = merge(push$, pop$, reload$).pipe(
      startWith({ url: new URL(window.location.href) } as Context),
      pairwise(),
      map(([old, current]) => Object.assign(current, { oldURL: old.url })),
      share(),
    );

    const page$ = merged$.pipe(
      filter(p => !isHashChange(p)),
      share(),
    );

    const hash$ = merged$.pipe(
      filter(p => isHashChange(p)),
      filter(() => history.state && history.state[this.histId]),
      observeOn<Context>(animationFrameScheduler),
      tap(context => {
        this.#historyManager.updateHistoryState(context);
        this.#scrollManager.manageScrollPosition(context);
      }),
    );

    const pauser$ = defer(() => merge(
      page$.pipe(mapTo(true)),
      this.#response$.pipe(mapTo(false)),
    )).pipe(
      startWith(false),
    );

    const hint$: Observable<Context> = hintEvent$.pipe(
      // takeUntil(this.subjects.disconnect),
      filterWhen(pauser$.pipe(map(x => !x))),
      map(([event, anchor]) => ({
        cause: Cause.Hint,
        url: new URL(anchor.href, this.href),
        anchor,
        event,
        cacheNr: this.#cacheNr,
      })),
      filter(x => isHintEvent(x, this)),
    );

    const prefetchResponse$ = merge(hint$, page$).pipe(
      distinctUntilChanged((x, y) => compareContext(x, y)),
      switchMap(x => this.#fetchManager.fetchPage(x)),
      startWith({ url: {} } as ResponseContext),
      share(),
    );

    const response$ = this.#response$ = page$.pipe(
      tap(context => {
        this.#eventManager.onStart(context)
        this.#historyManager.updateHistoryState(context);
        this.#url = context.url;
      }),
      withLatestFrom(prefetchResponse$),
      switchMap((args) => this.#fetchManager.getResponse(prefetchResponse$, ...args)),
      share(),
    );

    const responseOk$ = response$.pipe(filter((ctx): ctx is ResponseContextOk => !ctx.error));
    const responseErr$ = response$.pipe(filter((ctx): ctx is ResponseContextErr => !!ctx.error));

    const main$ = responseOk$.pipe(
      map(context => this.#updateManager.responseToContent(context)),
      tap(context => this.#eventManager.emitReady(context)),
      observeOn(animationFrameScheduler),
      tap(context => {
        this.#updateManager.updateDOM(context);
        this.#historyManager.updateTitle(context)
        this.#eventManager.emitAfter(context);
      }),
      startWith({
        cause: Cause.Init,
        url: this.#url,
        scripts: [],
      }),
      observeOn(animationFrameScheduler),
      tap(context => this.#scrollManager.manageScrollPosition(context)),
      tap({ error: (e) => this.#eventManager.emitDOMError(e) }),
      catchError((_, c) => c),
      switchMap((x) => this.fadePromise.then(() => x)),
      switchMap(x => this.#updateManager.reinsertScriptTags(x)),
      tap({ error: e => this.#eventManager.emitError(e) }),
      catchError((_, c) => c),
      tap(context => this.#eventManager.emitLoad(context)),
    );

    const error$ = responseErr$.pipe(
      tap(e => this.#eventManager.emitNetworkError(e)),
    );

    const progress$ = page$.pipe(
      switchMap(context =>
        defer(() => this.animPromise).pipe(
          takeUntil(response$),
          mapTo(context),
        ),
      ),
      tap(context => this.#eventManager.emitProgress(context)),
    );

    // Subscriptions
    main$.subscribe();
    hash$.subscribe();
    error$.subscribe();
    progress$.subscribe();

    this.#initialized.resolve(this);
    this.fireEvent('init');
  }

  disconnectedCallback() {
    window.removeEventListener("beforeunload", this.#historyManager.updateHistoryScrollPosition);
    document.documentElement.removeEventListener('click', this.#updateHistoryScrollPosition);
  }
}
