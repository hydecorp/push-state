// # src / mixin / event-listeners.js
// Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Subject, Observable, fromEvent } from "rxjs";

import { matchesAncestors, createMutationObservable, subscribeWhen } from "./common";
import { map, filter, startWith, tap } from "rxjs/operators";

export class EventListenersMixin {
  el: HTMLElement;
  
  linkSelector: string;

  linkSelector$: Observable<string>;
  prefetch$: Observable<boolean>;

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

      this.linkSelector$.subscribe(() => {
        links.forEach(removeLink);
        addListeners(this.el);
      });

      createMutationObservable(this.el, { childList: true, subtree: true })
        .pipe(
          startWith({ addedNodes: [this.el], removedNodes: [] }),
          tap({ complete() { links.forEach(removeLink) }}),
          subscribeWhen(this.prefetch$),
        )
        .subscribe(({ addedNodes, removedNodes }) => {
          removedNodes.forEach(removeListeners);
          addedNodes.forEach(addListeners);
        });
    }
  }
};
