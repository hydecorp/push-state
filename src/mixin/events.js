// # src / mixin / events.js
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

import { Observable, timer } from "rxjs/_esm5";

// ### Event functions
// These functions are called at various points along the observable pipeline to fire events,
// and cause other side effects.
export const eventMixin = C =>
  class extends C {
    // #### On start
    onStart(context) {
      // By default, hy-push-state will wait at least `duration` ms before replacing the content,
      // so that animations have enough time to finish.
      // The behavior is encoded with a promise that resolves after `duration` ms.
      this.animPromise = timer(this.duration);

      // The `transitionUntil` function lets users of this component override the animation promise.
      // This allows for event-based code execution, rather than timing-based, which prevents hiccups
      // and glitches when, for example, painting takes longer than expected.
      const transitionUntil = promise => {
        if (process.env.DEBUG && !(promise instanceof Promise || promise instanceof Observable)) {
          console.warn("transitionUntil expects a Promise as first argument.");
        }
        this.animPromise = promise;
      };

      this.fireEvent("start", {
        detail: Object.assign(context, { transitionUntil }),
      });
    }

    // Example usage of `transitionUntil`:
    //
    // ```js
    // hyPushStateEl.addEventListener('hy-push-state-start', ({ detail }) => {
    //   const animPromise = new Promise((resolve) => {
    //     const anim = myContent.animate(...);
    //     anim.addEventListener('finish', resolve);
    //   });
    //   detail.transitionUntil(animPromise);
    // });
    // ```
    // {:style="font-style:italic"}

    // #### Error callbacks
    // This function handles errors while trying to insert the new content into the document.
    // If the retrieved documened doesn't contain the ids we are looking for
    // we can't insert the content dynamically, so we tell the browser to open the link directly.
    onDOMError(context) {
      const { replaceElMissing, url } = context;

      // Ideally you should prevent this situation by adding the
      // `no-push-state` CSS class
      // on links to documents that don't match the expected document layout.
      // This only serves as a fallback.
      if (replaceElMissing) {
        if (process.env.DEBUG) {
          const ids = this.replaceIds
            .concat(this.el.id || [])
            .map(x => `#${x}`)
            .join(", ");
          console.warn(
            `Couldn't find one or more ids of '${ids}' in the document at '${window.location}'. Opening the link directly.`
          );
        }

        // To open the link directly, we first pop one entry off the browser history.
        // We have to do this because (some) browsers won't handle the back button correctly otherwise.
        // We then wait for a short time and change the document's location.
        // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
        window.history.back();
        setTimeout(() => {
          document.location.href = url;
        }, 100);

        // If it's a different error, throw the generic `error` event.
      } else {
        if (process.env.DEBUG) console.error(context);
        this.fireEvent("error", { detail: context });
      }
    }

    // If there is a network error during (pre-) fetching, fire `networkerror` event.
    onNetworkError(context) {
      if (process.env.DEBUG) console.error(context);
      this.fireEvent("networkerror", { detail: context });
    }

    // When using the experimental script feature,
    // fire `scripterror` event if something goes wrong during script insertion.
    onError(context) {
      if (process.env.DEBUG) console.error(context);
      this.fireEvent("error", { detail: context });
    }

    // #### Others
    // These event callbacks simply fire an event and pass the context as `detail`.
    onReady(context) {
      this.fireEvent("ready", { detail: context });
    }

    onAfter(context) {
      this.fireEvent("after", { detail: context });
    }

    onProgress(context) {
      this.fireEvent("progress", { detail: context });
    }

    onLoad(context) {
      this.fireEvent("load", { detail: context });
    }
  };
