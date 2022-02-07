var _HyPushState_initialized, _HyPushState_scrollManager, _HyPushState_historyManager, _HyPushState_fetchManager, _HyPushState_updateManager, _HyPushState_eventManager, _HyPushState_url, _HyPushState_setLocation, _HyPushState_cacheNr, _HyPushState_reload$, _HyPushState_updateHistoryScrollPosition, _HyPushState_response$, _HyPushState_upgrade;
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
        _HyPushState_initialized.set(this, createResolvablePromise());
        this.animPromise = Promise.resolve(null);
        this.fadePromise = Promise.resolve(null);
        _HyPushState_scrollManager.set(this, new ScrollManager(this));
        _HyPushState_historyManager.set(this, new HistoryManager(this));
        _HyPushState_fetchManager.set(this, new FetchManager(this));
        _HyPushState_updateManager.set(this, new UpdateManager(this));
        _HyPushState_eventManager.set(this, new EventManager(this));
        _HyPushState_url.set(this, new URL(this.baseURL));
        _HyPushState_setLocation.set(this, (key, value) => {
            const u = new URL(__classPrivateFieldGet(this, _HyPushState_url, "f").href);
            u[key] = value;
            this.assign(u.href);
        }
        // Implement Location
        );
        _HyPushState_cacheNr.set(this, 0);
        _HyPushState_reload$.set(this, new Subject());
        _HyPushState_updateHistoryScrollPosition.set(this, (event) => {
            const anchor = matchesAncestors(event.target, 'a[href]');
            if (isExternal(anchor)) {
                __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryScrollPosition();
            }
        });
        _HyPushState_response$.set(this, void 0);
        _HyPushState_upgrade.set(this, () => {
            const { pushEvent$, hintEvent$ } = this.setupEventListeners();
            const push$ = pushEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            map(([event, anchor]) => ({
                cause: Cause.Push,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"),
            })), filter(x => isPushEvent(x, this)), tap(({ event }) => {
                event.preventDefault();
                __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryScrollPosition();
            }));
            const pop$ = fromEvent(window, "popstate").pipe(
            // takeUntil(this.subjects.disconnect),
            filter(() => window.history.state && window.history.state[this.histId]), map(event => ({
                cause: Cause.Pop,
                url: new URL(window.location.href),
                cacheNr: __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"),
                event,
            })));
            const reload$ = __classPrivateFieldGet(this, _HyPushState_reload$, "f"); // .pipe(takeUntil(this.subjects.disconnect));
            const merged$ = merge(push$, pop$, reload$).pipe(startWith({ url: new URL(window.location.href) }), pairwise(), map(([old, current]) => Object.assign(current, { oldURL: old.url })), share());
            const page$ = merged$.pipe(filter(p => !isHashChange(p)), share());
            const hash$ = merged$.pipe(filter(p => isHashChange(p)), filter(() => history.state && history.state[this.histId]), observeOn(animationFrameScheduler), tap(context => {
                __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryState(context);
                __classPrivateFieldGet(this, _HyPushState_scrollManager, "f").manageScrollPosition(context);
            }));
            const pauser$ = defer(() => merge(page$.pipe(mapTo(true)), __classPrivateFieldGet(this, _HyPushState_response$, "f").pipe(mapTo(false)))).pipe(startWith(false));
            const hint$ = hintEvent$.pipe(
            // takeUntil(this.subjects.disconnect),
            filterWhen(pauser$.pipe(map(x => !x))), map(([event, anchor]) => ({
                cause: Cause.Hint,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"),
            })), filter(x => isHintEvent(x, this)));
            const prefetchResponse$ = merge(hint$, page$).pipe(distinctUntilChanged((x, y) => compareContext(x, y)), switchMap(x => __classPrivateFieldGet(this, _HyPushState_fetchManager, "f").fetchPage(x)), startWith({ url: {} }), share());
            const response$ = __classPrivateFieldSet(this, _HyPushState_response$, page$.pipe(tap(context => {
                __classPrivateFieldGet(this, _HyPushState_eventManager, "f").onStart(context);
                __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryState(context);
                __classPrivateFieldSet(this, _HyPushState_url, context.url, "f");
            }), withLatestFrom(prefetchResponse$), switchMap((args) => __classPrivateFieldGet(this, _HyPushState_fetchManager, "f").getResponse(prefetchResponse$, ...args)), share()), "f");
            const responseOk$ = response$.pipe(filter((ctx) => !ctx.error));
            const responseErr$ = response$.pipe(filter((ctx) => !!ctx.error));
            const main$ = responseOk$.pipe(map(context => __classPrivateFieldGet(this, _HyPushState_updateManager, "f").responseToContent(context)), tap(context => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitReady(context)), observeOn(animationFrameScheduler), tap(context => {
                __classPrivateFieldGet(this, _HyPushState_updateManager, "f").updateDOM(context);
                __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateTitle(context);
                __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitAfter(context);
            }), startWith({
                cause: Cause.Init,
                url: __classPrivateFieldGet(this, _HyPushState_url, "f"),
                scripts: [],
            }), observeOn(animationFrameScheduler), tap(context => __classPrivateFieldGet(this, _HyPushState_scrollManager, "f").manageScrollPosition(context)), tap({ error: (e) => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitDOMError(e) }), catchError((_, c) => c), switchMap((x) => this.fadePromise.then(() => x)), switchMap(x => __classPrivateFieldGet(this, _HyPushState_updateManager, "f").reinsertScriptTags(x)), tap({ error: e => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitError(e) }), catchError((_, c) => c), tap(context => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitLoad(context)));
            const error$ = responseErr$.pipe(tap(e => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitNetworkError(e)));
            const progress$ = page$.pipe(switchMap(context => defer(() => this.animPromise).pipe(takeUntil(response$), mapTo(context))), tap(context => __classPrivateFieldGet(this, _HyPushState_eventManager, "f").emitProgress(context)));
            // Subscriptions
            main$.subscribe();
            hash$.subscribe();
            error$.subscribe();
            progress$.subscribe();
            __classPrivateFieldGet(this, _HyPushState_initialized, "f").resolve(this);
            this.fireEvent('init');
        });
    }
    createRenderRoot() { return this; }
    get initialized() {
        return __classPrivateFieldGet(this, _HyPushState_initialized, "f");
    }
    // Implement Location
    get hash() { return __classPrivateFieldGet(this, _HyPushState_url, "f").hash; }
    get host() { return __classPrivateFieldGet(this, _HyPushState_url, "f").host; }
    get hostname() { return __classPrivateFieldGet(this, _HyPushState_url, "f").hostname; }
    get href() { return __classPrivateFieldGet(this, _HyPushState_url, "f").href; }
    get pathname() { return __classPrivateFieldGet(this, _HyPushState_url, "f").pathname; }
    get port() { return __classPrivateFieldGet(this, _HyPushState_url, "f").port; }
    get protocol() { return __classPrivateFieldGet(this, _HyPushState_url, "f").protocol; }
    get search() { return __classPrivateFieldGet(this, _HyPushState_url, "f").search; }
    get origin() { return __classPrivateFieldGet(this, _HyPushState_url, "f").origin; }
    get ancestorOrigins() { return window.location.ancestorOrigins; }
    set hash(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'hash', value); }
    set host(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'host', value); }
    set hostname(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'hostname', value); }
    set href(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'href', value); }
    set pathname(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'pathname', value); }
    set port(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'port', value); }
    set protocol(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'protocol', value); }
    set search(value) { __classPrivateFieldGet(this, _HyPushState_setLocation, "f").call(this, 'search', value); }
    get histId() { return this.id || this.tagName; }
    assign(url) {
        var _a;
        __classPrivateFieldGet(this, _HyPushState_reload$, "f").next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: __classPrivateFieldSet(this, _HyPushState_cacheNr, (_a = __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"), ++_a), "f"),
        });
    }
    reload() {
        var _a;
        __classPrivateFieldGet(this, _HyPushState_reload$, "f").next({
            cause: Cause.Push,
            url: new URL(this.href),
            cacheNr: __classPrivateFieldSet(this, _HyPushState_cacheNr, (_a = __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"), ++_a), "f"),
            replace: true,
        });
    }
    replace(url) {
        var _a;
        __classPrivateFieldGet(this, _HyPushState_reload$, "f").next({
            cause: Cause.Push,
            url: new URL(url, this.href),
            cacheNr: __classPrivateFieldSet(this, _HyPushState_cacheNr, (_a = __classPrivateFieldGet(this, _HyPushState_cacheNr, "f"), ++_a), "f"),
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
        window.addEventListener("beforeunload", __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryScrollPosition);
        // Remember scroll position for backward/forward navigation cache.
        // Technically, this is only necessary for Safari, because other browsers will not use the BFN cache
        // when a beforeunload event is registered...
        document.documentElement.addEventListener('click', __classPrivateFieldGet(this, _HyPushState_updateHistoryScrollPosition, "f"));
        this.updateComplete.then(__classPrivateFieldGet(this, _HyPushState_upgrade, "f"));
    }
    disconnectedCallback() {
        window.removeEventListener("beforeunload", __classPrivateFieldGet(this, _HyPushState_historyManager, "f").updateHistoryScrollPosition);
        document.documentElement.removeEventListener('click', __classPrivateFieldGet(this, _HyPushState_updateHistoryScrollPosition, "f"));
    }
};
_HyPushState_initialized = new WeakMap(), _HyPushState_scrollManager = new WeakMap(), _HyPushState_historyManager = new WeakMap(), _HyPushState_fetchManager = new WeakMap(), _HyPushState_updateManager = new WeakMap(), _HyPushState_eventManager = new WeakMap(), _HyPushState_url = new WeakMap(), _HyPushState_setLocation = new WeakMap(), _HyPushState_cacheNr = new WeakMap(), _HyPushState_reload$ = new WeakMap(), _HyPushState_updateHistoryScrollPosition = new WeakMap(), _HyPushState_response$ = new WeakMap(), _HyPushState_upgrade = new WeakMap();
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