import { from, fromEvent, of, merge } from "rxjs";
import { matchesAncestors, createMutationObservable, subscribeWhen, bufferDebounceTime } from "./common";
import { map, filter, startWith, tap, flatMap, mergeAll, switchMap } from "rxjs/operators";
const flat = (x) => Array.prototype.concat.apply([], x);
const combineRecords = (records) => ({
    addedNodes: new Set(flat(records.map(r => Array.from(r.addedNodes)))),
    removedNodes: new Set(flat(records.map(r => Array.from(r.removedNodes)))),
});
export class EventListenersMixin {
    // LINKS 2
    setupEventListeners() {
        const pushEvent$ = fromEvent(this.el, "click").pipe(map(event => {
            const anchor = matchesAncestors(event.target, this.linkSelector);
            if (anchor instanceof HTMLAnchorElement) {
                return [event, anchor];
            }
        }), filter(x => !!x));
        const matchOrQuery = (el, selector) => {
            if (el.matches(selector)) {
                return of(el);
            }
            else {
                return from(el.querySelectorAll(selector));
            }
        };
        const addEventListeners = (link) => {
            return merge(fromEvent(link, "mouseenter", { passive: true }), fromEvent(link, "touchstart", { passive: true }), fromEvent(link, "focus", { passive: true })).pipe(map(event => [event, link]));
        };
        const hintEvent$ = this.$.linkSelector.pipe(switchMap((linkSelector) => {
            const links = new Map();
            const addLink = (link) => {
                if (!links.has(link)) {
                    links.set(link, addEventListeners(link));
                }
            };
            const removeLink = (link) => {
                links.delete(link);
            };
            return createMutationObservable(this.el, { childList: true, subtree: true }).pipe(startWith({ addedNodes: [this.el], removedNodes: [] }), bufferDebounceTime(500), map(combineRecords), switchMap(({ addedNodes, removedNodes }) => {
                from(removedNodes).pipe(filter(el => el instanceof Element), flatMap((el) => matchOrQuery(el, linkSelector)), tap(removeLink)).subscribe();
                from(addedNodes).pipe(filter(el => el instanceof Element), flatMap((el) => matchOrQuery(el, linkSelector)), tap(addLink)).subscribe();
                return from(links.values()).pipe(mergeAll());
            }), subscribeWhen(this.$.prefetch));
        }));
        return { hintEvent$, pushEvent$ };
    }
}
