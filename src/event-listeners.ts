import { Subject, Observable, from, fromEvent, of, merge, NEVER } from "rxjs";

import { matchesAncestors, createMutationObservable, subscribeWhen, bufferDebounceTime } from "./common";
import { map, filter, startWith, tap, mergeMap, mergeAll, switchMap } from "rxjs/operators";

const flat = <T>(x: Array<Array<T>>): Array<T> => Array.prototype.concat.apply([], x);

type MiniRecord = { addedNodes: Iterable<Node>, removedNodes: Iterable<Node> };

const combineRecords = (records: MiniRecord[]) => ({
  addedNodes: new Set(flat(records.map(r => Array.from(r.addedNodes)))),
  removedNodes: new Set(flat(records.map(r => Array.from(r.removedNodes)))),
});

export class EventListenersMixin {
  el!: HTMLElement;

  linkSelector!: string;

  $!: {
    linkSelector: Subject<string>;
    prefetch: Subject<boolean>;
  }

  // LINKS 2
  setupEventListeners() {
    const pushEvent$ = fromEvent(this.el, "click").pipe(
      map(event => {
        const anchor = matchesAncestors(<Element>event.target, this.linkSelector);
        if (anchor instanceof HTMLAnchorElement) {
          return [event, anchor] as [MouseEvent, HTMLAnchorElement];
        }
      }),
      filter(x => !!x),
    );

    const matchOrQuery = (el: Element, selector: string): Observable<HTMLAnchorElement> => {
      if (el.matches(selector) && el instanceof HTMLAnchorElement) {
        return of(el);
      } else {
        return from(el.querySelectorAll(selector)).pipe(
          filter((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement),
        );
      }
    }

    const addEventListeners = (link: HTMLAnchorElement) => {
      return merge(
        fromEvent(link, "mouseenter", { passive: true }),
        fromEvent(link, "touchstart", { passive: true }),
        fromEvent(link, "focus", { passive: true }),
      ).pipe(map(event => [event, link] as [Event, HTMLAnchorElement]))
    };

    const hintEvent$ = this.$.linkSelector.pipe(switchMap((linkSelector) => {
      const links = new Map<HTMLAnchorElement, Observable<[Event, HTMLAnchorElement]>>();

      const addLink = (link: HTMLAnchorElement) => {
        if (!links.has(link)) {
          links.set(link, addEventListeners(link));
        }
      }
      const removeLink = (link: HTMLAnchorElement) => {
        links.delete(link);
      }


      return createMutationObservable(this.el, { childList: true, subtree: true }).pipe(
        startWith({ addedNodes: [this.el], removedNodes: [] }),
        bufferDebounceTime(500),
        map(combineRecords),
        switchMap(({ addedNodes, removedNodes }) => {
          from(removedNodes).pipe(
            filter((el): el is Element => el instanceof Element),
            mergeMap(el => matchOrQuery(el, linkSelector)),
            tap(removeLink)
          ).subscribe()

          from(addedNodes).pipe(
            filter((el): el is Element => el instanceof Element),
            mergeMap(el => matchOrQuery(el, linkSelector)),
            tap(addLink)
          ).subscribe()

          return from(links.values()).pipe(mergeAll());
        }),
        subscribeWhen(this.$.prefetch),
      );
    }));

    return { hintEvent$, pushEvent$ }
  }
}
