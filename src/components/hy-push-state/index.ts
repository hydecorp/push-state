/** 
 * Copyright (c) 2019 Florian Klampfer <https://qwtel.com/>
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
import { LitElement, property, customElement } from 'lit-element';

import { Observable, Subject, BehaviorSubject, merge, NEVER, defer, fromEvent } from "rxjs";
import { map, filter, tap, takeUntil, startWith, pairwise, share, mapTo, switchMap, distinctUntilChanged, withLatestFrom, catchError } from 'rxjs/operators';

import { applyMixins, unsubscribeWhen, Context, Cause, ClickContext, isPushEvent, isHashChange, isHintEvent } from './common';

import { FetchManager, ResponseContext } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';

// HACK: Applying mixins to the base class so they are defined by the time `customElement` kicks in...
@applyMixins(EventListenersMixin)
class RxLitElement extends LitElement {
  $connected = new Subject<boolean>();
  connectedCallback() { 
    super.connectedCallback()
    this.$connected.next(true) 
  }
  disconnectedCallback() { 
    super.disconnectedCallback()
    this.$connected.next(false) 
  }

  private firstUpdate: boolean
  $: {}

  firstUpdated() {
    this.firstUpdate = true
  }

  updated(changedProperties: Map<string, any>) {
    if (!this.firstUpdate) for (const prop of changedProperties.keys()) {
      if (prop in this.$) this.$[prop].next(this[prop]);
    }
    this.firstUpdate = false
  }
}

@customElement('hy-push-state')
export class HyPushState extends RxLitElement implements Location, EventListenersMixin {
  el: HTMLElement = this

  createRenderRoot() { return this }

  @property({ type: String, reflect: true, attribute: 'replace-selector' }) replaceSelector?: string;
  @property({ type: String, reflect: true, attribute: 'link-selector' }) linkSelector: string = "a[href]:not([data-no-push])";
  @property({ type: String, reflect: true, attribute: 'script-selector' }) scriptSelector?: string;
  @property({ type: Boolean, reflect: true, attribute: 'prefetch' }) prefetch: boolean = false;
  @property({ type: Number, reflect: true, attribute: 'duration' }) duration: number = 0;

  @property({ type: String }) baseUrl: string = window.location.href;

  $: {
    linkSelector?: Subject<string>;
    prefetch?: Subject<boolean>;
  } = {}

  animPromise: Promise<{}>;

  scrollManager = new ScrollManager(this);
  historyManager = new HistoryManager(this);
  fetchManager = new FetchManager(this);
  updateManager = new UpdateManager(this);
  eventManager = new EventManager(this);

  _url: URL

  set url(url: URL) {
    this._url = url
  }

  // Implement Location
  get hash() { return this._url.hash }
  get host() { return this._url.host }
  get hostname() { return this._url.hostname }
  get href() { return this._url.href }
  get origin() { return this._url.origin }
  get pathname() { return this._url.pathname }
  get port() { return this._url.port }
  get protocol() { return this._url.protocol }
  get search() { return this._url.search }
  get ancestorOrigins() { return window.location.ancestorOrigins }
  // TODO: Setters

  // EventListenersMixin
  setupEventListeners: () => void;
  pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
  hintEvent$: Observable<[Event, HTMLAnchorElement]>;

  reload$ = new Subject<Context>();

  // Methods
  private cacheNr = 0;

  histId() { return this.id || this.tagName; }

  @property()
  assign(url: string) {
    this.reload$.next({
      cause: Cause.Push,
      url: new URL(url, this.href),
      cacheNr: ++this.cacheNr,
    });
  }

  @property()
  reload() {
    this.reload$.next({
      cause: Cause.Push,
      url: new URL(this.href),
      cacheNr: ++this.cacheNr,
      replace: true,
    });
  }

  @property()
  replace(url: string) {
    this.reload$.next({
      cause: Cause.Push,
      url: new URL(url, this.href),
      cacheNr: ++this.cacheNr,
      replace: true,
    });
  }

  compareContext(p: Context, q: Context) {
    return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
  }

  connectedCallback() {
    super.connectedCallback()

    this.$.linkSelector = new BehaviorSubject(this.linkSelector);
    this.$.prefetch = new BehaviorSubject(this.prefetch);

    this.setupEventListeners();

    const deferred: { response$?: Observable<ResponseContext> } = {};

    const push$: Observable<ClickContext> = this.pushEvent$.pipe(
      // takeUntil(this.subjects.disconnect),
      map(([event, anchor]) => ({
        cause: Cause.Push,
        url: new URL(anchor.href, this.href),
        anchor,
        event,
        cacheNr: this.cacheNr,
      })),
      filter(x => isPushEvent(x, this)),
      tap(({ event }) => {
        event.preventDefault();
        this.historyManager.updateHistoryScrollPosition();
      })
    );

    const pop$: Observable<Context> = fromEvent(window, "popstate").pipe(
      // takeUntil(this.subjects.disconnect),
      filter(() => window.history.state && window.history.state[this.histId()]),
      map(event => ({
        cause: Cause.Pop,
        url: new URL(window.location.href, this.href),
        event,
        cacheNr: this.cacheNr,
      }))
    );

    const reload$ = this.reload$;
    // .pipe(takeUntil(this.subjects.disconnect));

    const merged$ = merge<Context>(push$, pop$, reload$).pipe(
      startWith({ url: new URL(this.baseUrl) } as Context),
      tap(({ url }) => (this.url = url)),
      pairwise(),
      share(),
    );

    const page$ = merged$.pipe(
      filter(p => !isHashChange(...p)),
      map(([, x]) => x),
      share(),
    );

    const hash$ = merged$.pipe(
      filter(p => isHashChange(...p)),
      map(([, x]) => x),
    );

    const pauser$ = defer(() => merge(
      page$.pipe(mapTo(true)),
      deferred.response$.pipe(mapTo(false)),
    )).pipe(
      startWith(false),
    );

    const hint$: Observable<Context> = this.hintEvent$.pipe(
      // takeUntil(this.subjects.disconnect),
      unsubscribeWhen(pauser$),
      map(([event, anchor]) => ({
        cause: Cause.Hint,
        url: new URL(anchor.href, this.href),
        anchor,
        event,
        cacheNr: this.cacheNr,
      })),
      filter(x => isHintEvent(x, this)),
    );

    const prefetchResponse$ = merge(hint$, page$).pipe(
      distinctUntilChanged((x, y) => this.compareContext(x, y)),
      switchMap(x => this.fetchManager.fetchPage(x)),
      startWith({ url: {} } as ResponseContext),
      share(),
    );

    const response$ = deferred.response$ = page$.pipe(
      tap(context => {
        this.historyManager.updateHistoryState(context);
        this.eventManager.onStart(context);
      }),
      withLatestFrom(prefetchResponse$),
      switchMap((args) => this.fetchManager.getResponse(prefetchResponse$, ...args)),
      share(),
    );

    const responseOk$ = response$.pipe(filter(({ error }) => !error));
    const responseErr$ = response$.pipe(filter(({ error }) => error));

    const main$ = responseOk$.pipe(
      map(context => this.updateManager.responseToContent(context)),
      tap(context => {
        this.eventManager.emitReady(context);
        this.updateManager.updateDOM(context);
        this.historyManager.updateHistoryTitle(context);
        this.scrollManager.manageScrollPostion(context);
        this.eventManager.emitAfter(context);
      }),
      tap({ error: e => this.eventManager.emitDOMError(e) }),
      catchError((_, c) => c),
      switchMap(x => this.updateManager.reinsertScriptTags(x)),
      tap({ error: e => this.eventManager.emitError(e) }),
      catchError((_, c) => c)
    );

    main$
      .subscribe(context => this.eventManager.emitLoad(context));

    hash$
      .subscribe(context => {
        this.historyManager.updateHistoryStateHash(context);
        this.scrollManager.manageScrollPostion(context);
      });

    responseErr$
      .subscribe(e => this.eventManager.emitNetworkError(e));

    page$.pipe(switchMap(context =>
      defer(() => this.animPromise).pipe(
        takeUntil(response$),
        mapTo(context),
      ),
    ))
      .subscribe(context => this.eventManager.emitProgress(context));
  }
}