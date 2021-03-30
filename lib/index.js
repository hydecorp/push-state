var _initialized, _scrollManager, _historyManager, _fetchManager, _updateManager, _eventManager, _url, _setLocation, _cacheNr, _reload$, _updateHistoryScrollPosition, _response$, _upgrade;
import { __classPrivateFieldGet, __classPrivateFieldSet, __decorate } from "tslib";
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
import { RxLitElement, createResolvablePromise, matchesAncestors } from '@hydecorp/component';
import { applyMixins, Cause, isPushEvent, isHashChange, isHintEvent, filterWhen, isExternal } from './common';
import { FetchManager } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';
function compareContext(p, q) {
    return p.url.href === q.url.href && p.error === q.error && p.cacheNr === q.cacheNr;
}
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
        _initialized.set(this, createResolvablePromise());
        this.animPromise = Promise.resolve(null);
        this.fadePromise = Promise.resolve(null);
        _scrollManager.set(this, new ScrollManager(this));
        _historyManager.set(this, new HistoryManager(this));
        _fetchManager.set(this, new FetchManager(this));
        _updateManager.set(this, new UpdateManager(this));
        _eventManager.set(this, new EventManager(this));
        _url.set(this, new URL(this.baseURL));
        _setLocation.set(this, (key, value) => {
            const u = new URL(__classPrivateFieldGet(this, _url).href);
            u[key] = value;
            this.assign(u.href);
        }
        // Implement Location
        );
        _cacheNr.set(this, 0);
        _reload$.set(this, new Subject());
        _updateHistoryScrollPosition.set(this, (event) => {
            const anchor = matchesAncestors(event.target, 'a[href]');
            if (isExternal(anchor)) {
                console.log(event);
                __classPrivateFieldGet(this, _historyManager).updateHistoryScrollPosition();
            }
        });
        _response$.set(this, void 0);
        _upgrade.set(this, () => {
            const { pushEvent$, hintEvent$ } = this.setupEventListeners();
            const push$ = pushEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            map(([event, anchor]) => ({
                cause: Cause.Push,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: __classPrivateFieldGet(this, _cacheNr),
            })), filter(x => isPushEvent(x, this)), tap(({ event }) => {
                event.preventDefault();
                __classPrivateFieldGet(this, _historyManager).updateHistoryScrollPosition();
            }));
            const pop$ = fromEvent(window, "popstate").pipe(
            // takeUntil(this.subjects.disconnect),
            filter(() => window.history.state && window.history.state[this.histId]), map(event => ({
                cause: Cause.Pop,
                url: new URL(window.location.href),
                cacheNr: __classPrivateFieldGet(this, _cacheNr),
                event,
            })));
            const reload$ = __classPrivateFieldGet(this, _reload$); // .pipe(takeUntil(this.subjects.disconnect));
            const merged$ = merge(push$, pop$, reload$).pipe(startWith({ url: new URL(window.location.href) }), pairwise(), map(([old, current]) => Object.assign(current, { oldURL: old.url })), share());
            const page$ = merged$.pipe(filter(p => !isHashChange(p)), share());
            const hash$ = merged$.pipe(filter(p => isHashChange(p)), filter(() => history.state && history.state[this.histId]), observeOn(animationFrameScheduler), tap(context => {
                __classPrivateFieldGet(this, _historyManager).updateHistoryState(context);
                __classPrivateFieldGet(this, _scrollManager).manageScrollPosition(context);
            }));
            const pauser$ = defer(() => merge(page$.pipe(mapTo(true)), __classPrivateFieldGet(this, _response$).pipe(mapTo(false)))).pipe(startWith(false));
            const hint$ = hintEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            filterWhen(pauser$.pipe(map(x => !x))), map(([event, anchor]) => ({
                cause: Cause.Hint,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: __classPrivateFieldGet(this, _cacheNr),
            })), filter(x => isHintEvent(x, this)));
            const prefetchResponse$ = merge(hint$, page$).pipe(distinctUntilChanged((x, y) => compareContext(x, y)), switchMap(x => __classPrivateFieldGet(this, _fetchManager).fetchPage(x)), startWith({ url: {} }), share());
            const response$ = __classPrivateFieldSet(this, _response$, page$.pipe(tap(context => {
                __classPrivateFieldGet(this, _eventManager).onStart(context);
                __classPrivateFieldGet(this, _historyManager).updateHistoryState(context);
                __classPrivateFieldSet(this, _url, context.url);
            }), withLatestFrom(prefetchResponse$), switchMap((args) => __classPrivateFieldGet(this, _fetchManager).getResponse(prefetchResponse$, ...args)), share()));
            const responseOk$ = response$.pipe(filter((ctx) => !ctx.error));
            const responseErr$ = response$.pipe(filter((ctx) => !!ctx.error));
            const main$ = responseOk$.pipe(map(context => __classPrivateFieldGet(this, _updateManager).responseToContent(context)), tap(context => __classPrivateFieldGet(this, _eventManager).emitReady(context)), observeOn(animationFrameScheduler), tap(context => {
                __classPrivateFieldGet(this, _updateManager).updateDOM(context);
                __classPrivateFieldGet(this, _historyManager).updateTitle(context);
                __classPrivateFieldGet(this, _eventManager).emitAfter(context);
            }), startWith({
                cause: Cause.Init,
                url: __classPrivateFieldGet(this, _url),
                scripts: [],
            }), observeOn(animationFrameScheduler), tap(context => __classPrivateFieldGet(this, _scrollManager).manageScrollPosition(context)), tap({ error: (e) => __classPrivateFieldGet(this, _eventManager).emitDOMError(e) }), catchError((_, c) => c), switchMap((x) => this.fadePromise.then(() => x)), switchMap(x => __classPrivateFieldGet(this, _updateManager).reinsertScriptTags(x)), tap({ error: e => __classPrivateFieldGet(this, _eventManager).emitError(e) }), catchError((_, c) => c), tap(context => __classPrivateFieldGet(this, _eventManager).emitLoad(context)));
            const error$ = responseErr$.pipe(tap(e => __classPrivateFieldGet(this, _eventManager).emitNetworkError(e)));
            const progress$ = page$.pipe(switchMap(context => defer(() => this.animPromise).pipe(takeUntil(response$), mapTo(context))), tap(context => __classPrivateFieldGet(this, _eventManager).emitProgress(context)));
            // Subscriptions
            main$.subscribe();
            hash$.subscribe();
            error$.subscribe();
            progress$.subscribe();
            __classPrivateFieldGet(this, _initialized).resolve(this);
            this.fireEvent('init');
        });
    }
    createRenderRoot() { return this; }
    get initialized() {
        return __classPrivateFieldGet(this, _initialized);
    }
    // Implement Location
    get hash() { return __classPrivateFieldGet(this, _url).hash; }
    get host() { return __classPrivateFieldGet(this, _url).host; }
    get hostname() { return __classPrivateFieldGet(this, _url).hostname; }
    get href() { return __classPrivateFieldGet(this, _url).href; }
    get pathname() { return __classPrivateFieldGet(this, _url).pathname; }
    get port() { return __classPrivateFieldGet(this, _url).port; }
    get protocol() { return __classPrivateFieldGet(this, _url).protocol; }
    get search() { return __classPrivateFieldGet(this, _url).search; }
    get origin() { return __classPrivateFieldGet(this, _url).origin; }
    get ancestorOrigins() { return window.location.ancestorOrigins; }
    set hash(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'hash', value); }
    set host(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'host', value); }
    set hostname(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'hostname', value); }
    set href(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'href', value); }
    set pathname(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'pathname', value); }
    set port(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'port', value); }
    set protocol(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'protocol', value); }
    set search(value) { __classPrivateFieldGet(this, _setLocation).call(this, 'search', value); }
    get histId() { return this.id || this.tagName; }
    assign(url) {
        __classPrivateFieldGet(this, _reload$).next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: __classPrivateFieldSet(this, _cacheNr, +__classPrivateFieldGet(this, _cacheNr) + 1),
        });
    }
    reload() {
        __classPrivateFieldGet(this, _reload$).next({
            cause: Cause.Push,
            url: new URL(this.href),
            cacheNr: __classPrivateFieldSet(this, _cacheNr, +__classPrivateFieldGet(this, _cacheNr) + 1),
            replace: true,
        });
    }
    replace(url) {
        __classPrivateFieldGet(this, _reload$).next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: __classPrivateFieldSet(this, _cacheNr, +__classPrivateFieldGet(this, _cacheNr) + 1),
            replace: true,
        });
    }
    connectedCallback() {
        super.connectedCallback();
        this.$ = {
            linkSelector: new BehaviorSubject(this.linkSelector),
            prefetch: new BehaviorSubject(this.prefetch),
        };
        // Remember the current scroll position (for F5/reloads).
        window.addEventListener("beforeunload", __classPrivateFieldGet(this, _historyManager).updateHistoryScrollPosition);
        // Remember scroll position for backward/forward navigation cache.
        // Technically, this is only necessary for Safari, because other browsers will not use the BFN cache
        // when a beforeunload event is registered...
        document.documentElement.addEventListener('click', __classPrivateFieldGet(this, _updateHistoryScrollPosition));
        this.updateComplete.then(__classPrivateFieldGet(this, _upgrade));
    }
    disconnectedCallback() {
        window.removeEventListener("beforeunload", __classPrivateFieldGet(this, _historyManager).updateHistoryScrollPosition);
        document.documentElement.removeEventListener('click', __classPrivateFieldGet(this, _updateHistoryScrollPosition));
    }
};
_initialized = new WeakMap(), _scrollManager = new WeakMap(), _historyManager = new WeakMap(), _fetchManager = new WeakMap(), _updateManager = new WeakMap(), _eventManager = new WeakMap(), _url = new WeakMap(), _setLocation = new WeakMap(), _cacheNr = new WeakMap(), _reload$ = new WeakMap(), _updateHistoryScrollPosition = new WeakMap(), _response$ = new WeakMap(), _upgrade = new WeakMap();
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
    property({ type: Boolean, reflect: true })
], HyPushState.prototype, "prefetch", void 0);
__decorate([
    property({ type: Number, reflect: true })
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