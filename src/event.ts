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
    const { replaceElMissing, url } = context;

    if (replaceElMissing) {
      if (process.env.DEBUG) {
        console.warn(
          `Couldn't find one or more element in the document at '${location}'. Opening the link directly.`
        );
      }

      // To open the link directly, we first pop one entry off the browser history.
      // We have to do this because (some) browsers won't handle the back button correctly otherwise.
      // We then wait for a short time and change the document's location.
      // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
      window.history.back();
      setTimeout(() => document.location.assign(url), 100);

      // If it's a different error, throw the generic `error` event.
    } else {
      this.parent.dispatchEvent(new CustomEvent('error', { detail: context }));
      if (process.env.DEBUG) console.error(context);
    }
  }

  emitNetworkError(context) {
    this.parent.dispatchEvent(new CustomEvent('networkerror', { detail: context }));
    if (process.env.DEBUG) console.error(context);
  }

  emitError(context) {
    this.parent.dispatchEvent(new CustomEvent('error', { detail: context }));
    if (process.env.DEBUG) console.error(context);
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