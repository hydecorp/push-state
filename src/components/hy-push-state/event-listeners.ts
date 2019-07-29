import { Subject, Observable, fromEvent } from "rxjs";

import { matchesAncestors, createMutationObservable, subscribeWhen } from "./common";
import { map, filter, startWith, tap } from "rxjs/operators";

export class EventListenersMixin {
  el: HTMLElement;
  
  linkSelector: string;

  $: {
    linkSelector?: Subject<string>;
    prefetch?: Subject<boolean>;
  }

  pushEvent$: Observable<[MouseEvent, HTMLAnchorElement]>;
  hintEvent$: Observable<[Event, HTMLAnchorElement]>;

  setupEventListeners() {
    this.pushEvent$ = fromEvent(this.el, "click").pipe(
      map(event => {
        const anchor = matchesAncestors(event.target as Element, this.linkSelector);
        if (anchor instanceof HTMLAnchorElement) {
          return [event, anchor] as [MouseEvent, HTMLAnchorElement];
        }
      }),
      filter(x => !!x),
    );

    // TODO: this.prefech?
    if ("MutationObserver" in window && "Set" in window) {
      const links = new Set();
      const hintSubject = new Subject<[Event, HTMLAnchorElement]>();
      this.hintEvent$ = hintSubject;

      const hintNext = (e: Event) => hintSubject.next([e, e.currentTarget as HTMLAnchorElement]);

      const addLink = (link: Element) => {
        if (!links.has(link)) {
          links.add(link);
          link.addEventListener("mouseenter", hintNext, { passive: true });
          link.addEventListener("touchstart", hintNext, { passive: true });
          link.addEventListener("focus", hintNext, { passive: true });

          // When fetching resources from an external domain, rewrite the link's href,
          // so that shift-click, etc works as expected.
          // if (isExternal(this)) {
          //   link.href = new URL(link.getAttribute("href"), this.href).href;
          // }
        }
      };

      const addListeners = (added: Node) => {
        if (added instanceof Element) {
          if (added.matches(this.linkSelector)) {
            addLink(added);
          } else {
            added.querySelectorAll(this.linkSelector).forEach(addLink);
          }
        }
      };

      const removeLink = (link: Element) => {
        links.delete(link);
        link.removeEventListener("mouseenter", hintNext);
        link.removeEventListener("touchstart", hintNext);
        link.removeEventListener("focus", hintNext);
      };

      const removeListeners = (removed: Node) => {
        if (removed instanceof Element) {
          if (removed.matches(this.linkSelector)) {
            removeLink(removed);
          } else {
            removed.querySelectorAll(this.linkSelector).forEach(removeLink);
          }
        }
      };

      this.$.linkSelector.subscribe(() => {
        links.forEach(removeLink);
        addListeners(this.el);
      });

      createMutationObservable(this.el, { childList: true, subtree: true })
        .pipe(
          startWith({ addedNodes: [this.el], removedNodes: [] }),
          tap({ complete() { links.forEach(removeLink) }}),
          subscribeWhen(this.$.prefetch),
        )
        .subscribe(({ addedNodes, removedNodes }) => {
          removedNodes.forEach(removeListeners);
          addedNodes.forEach(addListeners);
        });
    }
  }
};
