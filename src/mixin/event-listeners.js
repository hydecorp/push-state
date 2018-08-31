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

import { createXObservable } from "hy-component/src/rxjs";

import { matches, matchesAncestors } from "../common";

export const eventListenersMixin = C =>
  class extends C {
    setupEventListeners() {
      // #### Keeping track of links
      // We use a `MutationObserver` to keep track of all the links inside the component,
      // and put events on the `pushSubject` and `hintSubject` observables,
      // but first we need to check if `MutationObserver` is available.
      if ("MutationObserver" in window && "WeakSet" in window) {
        // A `Set` of `Element`s.
        // We use this to keep track of which links already have their event listeners registered.
        const links = new WeakSet();

        // Binding `next` functions to their `Subject`s,
        // so that we can pass them as callbacks directly. This is just for convenience.
        const pushNext = this.pushSubject.next.bind(this.pushSubject);
        const hintNext = this.hintSubject.next.bind(this.hintSubject);

        // We don't use `Observable.fromEvent` here to avoid creating too many observables.
        // Registering an unknown number of event listeners is somewhat debatable,
        // but we certainly don't want to make it wrose.
        // (The number could be brought down by using an `IntersectionObserver` in the future.
        // Also note that typically there will be an animation playing while this is happening,
        // so the effects are not easily noticed).
        //
        // In any case, `MutationObserver` and `Set` help us keep track of which links are children
        // of this component, so that we can reliably add and remove the event listeners.
        // The function to be called for every added node:
        const addLink = link => {
          if (!links.has(link)) {
            links.add(link);
            link.addEventListener("click", pushNext);
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

        const addListeners = addedNode => {
          if (addedNode instanceof Element) {
            if (matches.call(addedNode, this.linkSelector)) {
              addLink(addedNode);
            } else {
              Array.from(addedNode.querySelectorAll(this.linkSelector)).forEach(addLink);
            }
          }
        };

        // Next, The function to be called for every removed node.
        // Usually the elments will be removed from the document altogher
        // when they are removed from this component,
        // but since we can't be sure, we remove the event listeners anyway.
        const removeLink = link => {
          links.delete(link);
          link.removeEventListener("click", pushNext);
          link.removeEventListener("mouseenter", hintNext, { passive: true });
          link.removeEventListener("touchstart", hintNext, { passive: true });
          link.removeEventListener("focus", hintNext, { passive: true });
        };

        const removeListeners = removedNode => {
          if (removedNode instanceof Element) {
            if (matches.call(removedNode, this.linkSelector)) {
              removeLink(removedNode);
            } else {
              Array.from(removedNode.querySelectorAll(this.linkSelector)).forEach(removeLink);
            }
          }
        };

        // An observable wrapper around the mutation observer.
        // We're only interested in nodes entering and leaving the entire subtree of this component,
        // but not attribute changes.
        const mutation$ = createXObservable(MutationObserver)(
          this.el,
          {},
          {
            childList: true,
            subtree: true,
          }
        );

        // For every mutation, we remove the event listeners of elements that go out of the component
        // (if any), and add event listeners to all elements that make it into the compnent (if any).
        mutation$.subscribe(({ addedNodes, removedNodes }) => {
          Array.from(removedNodes).forEach(removeListeners.bind(this));
          Array.from(addedNodes).forEach(addListeners.bind(this));
        });

        // TODO
        this.subjects.linkSelector.subscribe(() => {
          // TODO
          Array.from(links).forEach(removeLink);

          // The mutation observer does not pick up the links that are already on the page,
          // so we add them manually here, once.
          addListeners.call(this, this.el);
        });

        // If we don't have `MutationObserver` and `Set`, we just register a `click` event listener
        // on the entire component, and check if a click occurred on one of our links.
        // Note that we can't reliably generate hints this way, so we don't.
      } else {
        this.el.addEventListener("click", event => {
          const anchor = matchesAncestors.call(event.target, this.linkSelector);
          if (anchor && anchor.href) {
            event.currentTarget = anchor; // eslint-disable-line no-param-reassign
            pushSubject.next(event);
          }
        });
      }
    }
  };
