var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { Subject, BehaviorSubject, merge, defer, fromEvent, animationFrameScheduler } from "rxjs";
import { map, filter, tap, takeUntil, startWith, pairwise, share, mapTo, switchMap, distinctUntilChanged, withLatestFrom, catchError, observeOn } from 'rxjs/operators';
import { RxLitElement, createResolvablePromise } from '@hydecorp/component';
import { applyMixins, Cause, isPushEvent, isHashChange, isHintEvent, filterWhen } from './common';
import { FetchManager } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';
let HyPushState = class HyPushState extends applyMixins(RxLitElement, [EventListenersMixin]) {
    constructor() {
        super(...arguments);
        this.el = this;
        this.linkSelector = "a[href]:not([data-no-push])";
        this.prefetch = false;
        this.duration = 0;
        // @property({ type: Boolean, reflect: true, attribute: 'simulate-load' }) simulateLoad: boolean = false;
        this.simulateHashChange = false;
        this.baseURL = window.location.href;
        this._initialized = createResolvablePromise();
        this.$ = {};
        this.fadePromise = Promise.resolve(null);
        this.scrollManager = new ScrollManager(this);
        this.historyManager = new HistoryManager(this);
        this.fetchManager = new FetchManager(this);
        this.updateManager = new UpdateManager(this);
        this.eventManager = new EventManager(this);
        this._url = new URL(this.baseURL);
        this.reload$ = new Subject();
        // Methods
        this.cacheNr = 0;
        this.upgrade = () => {
            const { pushEvent$, hintEvent$ } = this.setupEventListeners();
            const deferred = {};
            const push$ = pushEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            map(([event, anchor]) => ({
                cause: Cause.Push,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: this.cacheNr,
            })), filter(x => isPushEvent(x, this)), tap(({ event }) => {
                event.preventDefault();
                this.historyManager.updateHistoryScrollPosition();
            }));
            const pop$ = fromEvent(window, "popstate").pipe(
            // takeUntil(this.subjects.disconnect),
            filter(() => window.history.state && window.history.state[this.histId]), map(event => ({
                cause: Cause.Pop,
                url: new URL(window.location.href),
                cacheNr: this.cacheNr,
                event,
            })));
            const reload$ = this.reload$; // .pipe(takeUntil(this.subjects.disconnect));
            const merged$ = merge(push$, pop$, reload$).pipe(startWith({ url: new URL(window.location.href) }), pairwise(), map(([old, current]) => Object.assign(current, { oldURL: old.url })), share());
            const page$ = merged$.pipe(filter(p => !isHashChange(p)), share());
            const hash$ = merged$.pipe(filter(p => isHashChange(p)), filter(() => history.state && history.state[this.histId]), observeOn(animationFrameScheduler), tap(context => {
                this.historyManager.updateHistoryState(context);
                this.scrollManager.manageScrollPosition(context);
            }));
            const pauser$ = defer(() => merge(page$.pipe(mapTo(true)), deferred.response$.pipe(mapTo(false)))).pipe(startWith(false));
            const hint$ = hintEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            filterWhen(pauser$.pipe(map(x => !x))), map(([event, anchor]) => ({
                cause: Cause.Hint,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: this.cacheNr,
            })), filter(x => isHintEvent(x, this)));
            const prefetchResponse$ = merge(hint$, page$).pipe(distinctUntilChanged((x, y) => this.compareContext(x, y)), switchMap(x => this.fetchManager.fetchPage(x)), startWith({ url: {} }), share());
            const response$ = deferred.response$ = page$.pipe(tap(context => {
                this.eventManager.onStart(context);
                this.historyManager.updateHistoryState(context);
                this._url = context.url;
            }), withLatestFrom(prefetchResponse$), switchMap((args) => this.fetchManager.getResponse(prefetchResponse$, ...args)), share());
            const responseOk$ = response$.pipe(filter(({ error }) => !error));
            const responseError$ = response$.pipe(filter(({ error }) => !!error));
            const main$ = responseOk$.pipe(map(context => this.updateManager.responseToContent(context)), tap(context => this.eventManager.emitReady(context)), observeOn(animationFrameScheduler), tap(context => {
                this.updateManager.updateDOM(context);
                this.historyManager.updateTitle(context);
                this.eventManager.emitAfter(context);
            }), startWith({
                cause: Cause.Init,
                url: this._url,
                scripts: [],
            }), observeOn(animationFrameScheduler), tap(context => this.scrollManager.manageScrollPosition(context)), tap({ error: e => this.eventManager.emitDOMError(e) }), catchError((_, c) => c), switchMap((x) => this.fadePromise.then(() => x)), switchMap(x => this.updateManager.reinsertScriptTags(x)), tap({ error: e => this.eventManager.emitError(e) }), catchError((_, c) => c), tap(context => this.eventManager.emitLoad(context)));
            const error$ = responseError$.pipe(tap(e => this.eventManager.emitNetworkError(e)));
            const progress$ = page$.pipe(switchMap(context => defer(() => this.animPromise).pipe(takeUntil(response$), mapTo(context))), tap(context => this.eventManager.emitProgress(context)));
            // Subscriptions
            main$.subscribe();
            hash$.subscribe();
            error$.subscribe();
            progress$.subscribe();
            this._initialized.resolve(this);
            this.fireEvent('init');
        };
    }
    createRenderRoot() { return this; }
    get initialized() {
        return this._initialized;
    }
    _setLocation(key, value) {
        const u = new URL(this._url.href);
        u[key] = value;
        this.assign(u.href);
    }
    // Implement Location
    get hash() { return this._url.hash; }
    get host() { return this._url.host; }
    get hostname() { return this._url.hostname; }
    get href() { return this._url.href; }
    get pathname() { return this._url.pathname; }
    get port() { return this._url.port; }
    get protocol() { return this._url.protocol; }
    get search() { return this._url.search; }
    get origin() { return this._url.origin; }
    get ancestorOrigins() { return window.location.ancestorOrigins; }
    set hash(value) { this._setLocation('hash', value); }
    set host(value) { this._setLocation('host', value); }
    set hostname(value) { this._setLocation('hostname', value); }
    set href(value) { this._setLocation('href', value); }
    set pathname(value) { this._setLocation('pathname', value); }
    set port(value) { this._setLocation('port', value); }
    set protocol(value) { this._setLocation('protocol', value); }
    set search(value) { this._setLocation('search', value); }
    // Silent read-only
    set origin(_) { }
    set ancestorOrigins(_) { }
    get histId() { return this.id || this.tagName; }
    assign(url) {
        this.reload$.next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: ++this.cacheNr,
        });
    }
    reload() {
        this.reload$.next({
            cause: Cause.Push,
            url: new URL(this.href),
            cacheNr: ++this.cacheNr,
            replace: true,
        });
    }
    replace(url) {
        this.reload$.next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: ++this.cacheNr,
            replace: true,
        });
    }
    compareContext(p, q) {
        return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
    }
    connectedCallback() {
        super.connectedCallback();
        this.$.linkSelector = new BehaviorSubject(this.linkSelector);
        this.$.prefetch = new BehaviorSubject(this.prefetch);
        // Remember the current scroll position (for F5/reloads).
        window.addEventListener("beforeunload", this.historyManager.updateHistoryScrollPosition);
        this.updateComplete.then(this.upgrade);
    }
    disconnectedCallback() {
        window.removeEventListener("beforeunload", this.historyManager.updateHistoryScrollPosition);
    }
};
__decorate([
    property({ type: String, reflect: true, attribute: 'replace-selector' })
], HyPushState.prototype, "replaceSelector", void 0);
__decorate([
    property({ type: String, reflect: true, attribute: 'link-selector' })
], HyPushState.prototype, "linkSelector", void 0);
__decorate([
    property({ type: String, reflect: true, attribute: 'script-selector' })
], HyPushState.prototype, "scriptSelector", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'prefetch' })
], HyPushState.prototype, "prefetch", void 0);
__decorate([
    property({ type: Number, reflect: true, attribute: 'duration' })
], HyPushState.prototype, "duration", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'hashchange' })
], HyPushState.prototype, "simulateHashChange", void 0);
__decorate([
    property({ type: String })
], HyPushState.prototype, "baseURL", void 0);
__decorate([
    property()
], HyPushState.prototype, "assign", null);
__decorate([
    property()
], HyPushState.prototype, "reload", null);
__decorate([
    property()
], HyPushState.prototype, "replace", null);
HyPushState = __decorate([
    customElement('hy-push-state')
], HyPushState);
export { HyPushState };
//# sourceMappingURL=index.js.map