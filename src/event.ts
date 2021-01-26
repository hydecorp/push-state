import { Context } from './common';
import { ResponseContextErr } from './fetch';
import { HyPushState } from "./index";

const timeout = (t: number) => new Promise(r => setTimeout(r, t));

export class EventManager {
  private parent: HyPushState;

  constructor(parent: HyPushState) {
    this.parent = parent;
  }

  onStart(context: Context) {
    this.parent.animPromise = timeout(this.parent.duration);

    const transitionUntil = (promise: Promise<{}>) => {
      this.parent.animPromise = Promise.all([this.parent.animPromise, promise]);
    };

    this.parent.fireEvent('start', { detail: { ...context, transitionUntil } });
  }

  emitDOMError(error: any) {
    if (process.env.DEBUG) console.error(error);

    // To open the link directly, we first pop one entry off the browser history.
    // We have to do this because some browsers (Safari) won't handle the back button correctly otherwise.
    // We then wait for a short time and change the document's location.
    // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
    // TODO: Use browser sniffing instead?
    const url = location.href;
    window.history.back();
    setTimeout(() => document.location.assign(url), 100);
  }

  emitNetworkError(context: ResponseContextErr) {
    if (process.env.DEBUG) console.error(context);
    this.parent.fireEvent('networkerror', { detail: context });
  }

  emitError(context: Context) {
    if (process.env.DEBUG) console.error(context);
    this.parent.fireEvent('error', { detail: context });
  }

  emitReady(context: Context) {
    this.parent.fireEvent('ready', { detail: context });
  }

  emitAfter(context: Context) {
    this.parent.fadePromise = timeout(this.parent.duration);

    const transitionUntil = (promise: Promise<{}>) => {
      this.parent.fadePromise = Promise.all([this.parent.fadePromise, promise]);
    };

    this.parent.fireEvent('after', { detail: { ...context, transitionUntil } });
  }

  emitProgress(context: Context) {
    this.parent.fireEvent('progress', { detail: context });
  }

  emitLoad(context: Context) {
    this.parent.fireEvent('load', { detail: context });
  }
};