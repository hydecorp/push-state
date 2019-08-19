import { Context } from './common';
import { HyPushState } from "./index";

const timeout = (t: number) => new Promise(r => setTimeout(r, t));

export class EventManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  get animPromise() { return this.parent.animPromise; }
  set animPromise(p) { this.parent.animPromise = p; }
  
  get duration() { return this.parent.duration; };

  onStart(context: Context) {
    this.animPromise = timeout(this.duration);

    const transitionUntil = (promise: Promise<{}>) => {
      this.animPromise = promise;
    };

    this.parent.dispatchEvent(new CustomEvent('start', { 
      detail: { ...context, transitionUntil } 
    }));
  }

  emitDOMError(context) {
    console.error(context);
    const { replaceElMissing, url } = context;

    if (replaceElMissing) {
      // if (process.env.DEBUG) {
      //   const ids = this.replaceIds
      //     .concat(this.el.id || [])
      //     .map(x => `#${x}`)
      //     .join(", ");
      //   console.warn(
      //     `Couldn't find one or more ids of '${ids}' in the document at '${
      //     window.location
      //     }'. Opening the link directly.`
      //   );
      // }

      // To open the link directly, we first pop one entry off the browser history.
      // We have to do this because (some) browsers won't handle the back button correctly otherwise.
      // We then wait for a short time and change the document's location.
      // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
      window.history.back();
      setTimeout(() => (document.location.href = url), 100);

      // If it's a different error, throw the generic `error` event.
    } else {
      // if (process.env.DEBUG) console.error(context);
      this.parent.dispatchEvent(new CustomEvent('error', { detail: context }));
    }
  }

  emitNetworkError(context) {
    // if (process.env.DEBUG) console.error(context);
    this.parent.dispatchEvent(new CustomEvent('networkerror', { detail: context }));
  }

  emitError(context) {
    console.log(context.error);
    // if (process.env.DEBUG) console.error(context);
    this.parent.dispatchEvent(new CustomEvent('error', { detail: context }));
  }

  emitReady(context) {
    this.parent.dispatchEvent(new CustomEvent('ready', { detail: context }));
  }

  emitAfter(context) {
    this.parent.dispatchEvent(new CustomEvent('after', { detail: context }));
  }

  emitProgress(context) {
    this.parent.dispatchEvent(new CustomEvent('progress', { detail: context }));
  }

  emitLoad(context) {
    this.parent.dispatchEvent(new CustomEvent('load', { detail: context }));
    // if (this.parent.simulateLoad) document.dispatchEvent(new Event('load'))
  }
};