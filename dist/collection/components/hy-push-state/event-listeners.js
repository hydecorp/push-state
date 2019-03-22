import { Subject, fromEvent } from "rxjs";
import { matchesAncestors, createMutationObservable, subscribeWhen } from "./common";
import { map, filter, startWith, tap } from "rxjs/operators";
export class EventListenersMixin {
    setupEventListeners() {
        this.pushEvent$ = fromEvent(this.el, "click").pipe(map(event => {
            const anchor = matchesAncestors(event.target, this.linkSelector);
            if (anchor instanceof HTMLAnchorElement) {
                return [event, anchor];
            }
        }), filter(x => !!x));
        if ("MutationObserver" in window && "Set" in window) {
            const links = new Set();
            const hintSubject = new Subject();
            this.hintEvent$ = hintSubject;
            const hintNext = (e) => hintSubject.next([e, e.currentTarget]);
            const addLink = (link) => {
                if (!links.has(link)) {
                    links.add(link);
                    link.addEventListener("mouseenter", hintNext, { passive: true });
                    link.addEventListener("touchstart", hintNext, { passive: true });
                    link.addEventListener("focus", hintNext, { passive: true });
                }
            };
            const addListeners = (added) => {
                if (added instanceof Element) {
                    if (added.matches(this.linkSelector)) {
                        addLink(added);
                    }
                    else {
                        added.querySelectorAll(this.linkSelector).forEach(addLink);
                    }
                }
            };
            const removeLink = (link) => {
                links.delete(link);
                link.removeEventListener("mouseenter", hintNext);
                link.removeEventListener("touchstart", hintNext);
                link.removeEventListener("focus", hintNext);
            };
            const removeListeners = (removed) => {
                if (removed instanceof Element) {
                    if (removed.matches(this.linkSelector)) {
                        removeLink(removed);
                    }
                    else {
                        removed.querySelectorAll(this.linkSelector).forEach(removeLink);
                    }
                }
            };
            this.linkSelector$.subscribe(() => {
                links.forEach(removeLink);
                addListeners(this.el);
            });
            createMutationObservable(this.el, { childList: true, subtree: true })
                .pipe(startWith({ addedNodes: [this.el], removedNodes: [] }), tap({ complete() { links.forEach(removeLink); } }), subscribeWhen(this.prefetch$))
                .subscribe(({ addedNodes, removedNodes }) => {
                removedNodes.forEach(removeListeners);
                addedNodes.forEach(addListeners);
            });
        }
    }
}
;
