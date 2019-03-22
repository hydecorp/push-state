import { Subject, BehaviorSubject, merge, NEVER, defer, fromEvent } from "rxjs";
import { map, filter, tap, takeUntil, startWith, pairwise, share, mapTo, switchMap, distinctUntilChanged, withLatestFrom, catchError } from 'rxjs/operators';
import { applyMixins, unsubscribeWhen, Cause, isPushEvent, isHashChange, isHintEvent } from './common';
import { FetchManager } from './fetch';
import { UpdateManager } from './update';
import { EventListenersMixin } from './event-listeners';
import { EventManager } from './event';
import { HistoryManager } from './history';
import { ScrollManager } from './scroll';
export class HyPushState {
    constructor() {
        this.linkSelector = "a[href]:not([data-no-push])";
        this.prefetch = false;
        this.duration = 0;
        this.initialHref = window.location.href;
        this.scrollManager = new ScrollManager(this);
        this.historyManager = new HistoryManager(this);
        this.fetchManager = new FetchManager(this);
        this.updateManager = new UpdateManager(this);
        this.eventManager = new EventManager(this);
        this.reload$ = new Subject();
        this.cacheNr = 0;
    }
    setLinkSelector(_) { this.linkSelector$.next(_); }
    setPrefetch(_) { this.prefetch$.next(_); }
    get hash() { return this.url.hash; }
    get host() { return this.url.host; }
    get hostname() { return this.url.hostname; }
    get href() { return this.url.href; }
    get origin() { return this.url.origin; }
    get pathname() { return this.url.pathname; }
    get port() { return this.url.port; }
    get protocol() { return this.url.protocol; }
    get search() { return this.url.search; }
    get ancestorOrigins() { return window.location.ancestorOrigins; }
    ;
    histId() { return this.el.id || this.el.tagName; }
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
    componentWillLoad() {
        this.linkSelector$ = new BehaviorSubject(this.linkSelector);
        this.prefetch$ = new BehaviorSubject(this.prefetch);
        this.setupEventListeners();
        const deferred = {};
        const push$ = this.pushEvent$.pipe(map(([event, anchor]) => ({
            cause: Cause.Push,
            url: new URL(anchor.href, this.href),
            anchor,
            event,
            cacheNr: this.cacheNr,
        })), filter(x => isPushEvent(x, this)), tap(({ event }) => {
            event.preventDefault();
            this.historyManager.updateHistoryScrollPosition();
        }));
        const pop$ = fromEvent(window, "popstate").pipe(filter(() => window.history.state && window.history.state[this.histId()]), map(event => ({
            cause: Cause.Pop,
            url: new URL(window.location.href, this.href),
            event,
            cacheNr: this.cacheNr,
        })));
        const reload$ = this.reload$;
        const merged$ = merge(push$, pop$, reload$).pipe(startWith({ url: new URL(this.initialHref) }), tap(({ url }) => (this.url = url)), pairwise(), share());
        const page$ = merged$.pipe(filter(p => !isHashChange(...p)), map(([, x]) => x), share());
        const hash$ = merged$.pipe(filter(p => isHashChange(...p)), map(([, x]) => x));
        const pauser$ = defer(() => merge(page$.pipe(mapTo(true)), deferred.response$.pipe(mapTo(false)))).pipe(startWith(false));
        const hint$ = this.prefetch$.pipe(switchMap(prefetch => {
            if (!prefetch)
                return NEVER;
            return this.hintEvent$.pipe(unsubscribeWhen(pauser$), map(([event, anchor]) => ({
                cause: Cause.Hint,
                url: new URL(anchor.href, this.href),
                anchor,
                event,
                cacheNr: this.cacheNr,
            })), filter(x => isHintEvent(x, this)));
        }));
        const prefetchResponse$ = merge(hint$, page$).pipe(distinctUntilChanged((x, y) => this.compareContext(x, y)), switchMap(x => this.fetchManager.fetchPage(x)), startWith({ url: {} }), share());
        const response$ = deferred.response$ = page$.pipe(tap(context => {
            this.historyManager.updateHistoryState(context);
            this.eventManager.onStart(context);
        }), withLatestFrom(prefetchResponse$), switchMap((args) => this.fetchManager.getResponse(prefetchResponse$, ...args)), share());
        const responseOk$ = response$.pipe(filter(({ error }) => !error));
        const responseErr$ = response$.pipe(filter(({ error }) => error));
        const main$ = responseOk$.pipe(map(context => this.updateManager.responseToContent(context)), tap(context => {
            this.eventManager.emitReady(context);
            this.updateManager.updateDOM(context);
            this.historyManager.updateHistoryTitle(context);
            this.scrollManager.manageScrollPostion(context);
            this.eventManager.emitAfter(context);
        }), tap({ error: e => this.eventManager.emitDOMError(e) }), catchError((_, c) => c), switchMap(x => this.updateManager.reinsertScriptTags(x)), tap({ error: e => this.eventManager.emitError(e) }), catchError((_, c) => c));
        main$.subscribe(context => this.eventManager.emitLoad(context));
        hash$.subscribe(context => {
            this.historyManager.updateHistoryStateHash(context);
            this.scrollManager.manageScrollPostion(context);
        });
        responseErr$.subscribe(e => this.eventManager.emitNetworkError(e));
        page$.pipe(switchMap(context => defer(() => this.animPromise).pipe(takeUntil(response$), mapTo(context)))).subscribe(context => this.eventManager.emitProgress(context));
    }
    static get is() { return "hy-push-state"; }
    static get properties() { return {
        "assign": {
            "method": true
        },
        "duration": {
            "type": Number,
            "attr": "duration",
            "reflectToAttr": true,
            "mutable": true
        },
        "el": {
            "elementRef": true
        },
        "initialHref": {
            "type": String,
            "attr": "initial-href",
            "mutable": true
        },
        "linkSelector": {
            "type": String,
            "attr": "link-selector",
            "reflectToAttr": true,
            "mutable": true,
            "watchCallbacks": ["setLinkSelector"]
        },
        "prefetch": {
            "type": Boolean,
            "attr": "prefetch",
            "reflectToAttr": true,
            "mutable": true,
            "watchCallbacks": ["setPrefetch"]
        },
        "reload": {
            "method": true
        },
        "replace": {
            "method": true
        },
        "replaceSelector": {
            "type": String,
            "attr": "replace-selector",
            "reflectToAttr": true,
            "mutable": true
        },
        "scriptSelector": {
            "type": String,
            "attr": "script-selector",
            "reflectToAttr": true,
            "mutable": true
        }
    }; }
    static get events() { return [{
            "name": "start",
            "method": "start",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "ready",
            "method": "ready",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "after",
            "method": "after",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "progress",
            "method": "progress",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "load",
            "method": "load",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "error",
            "method": "error",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "networkerror",
            "method": "networkerror",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }]; }
}
applyMixins(HyPushState, [EventListenersMixin]);
