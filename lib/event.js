const timeout = (t) => new Promise(r => setTimeout(r, t));
export class EventManager {
    constructor(parent) {
        this.parent = parent;
    }
    get animPromise() { return this.parent.animPromise; }
    set animPromise(p) { this.parent.animPromise = p; }
    get duration() { return this.parent.duration; }
    ;
    onStart(context) {
        this.animPromise = timeout(this.duration);
        const transitionUntil = (promise) => {
            this.animPromise = promise;
        };
        this.parent.fireEvent('start', { detail: { ...context, transitionUntil } });
    }
    emitDOMError(context) {
        const { replaceElMissing, url } = context;
        if (replaceElMissing) {
            if (process.env.DEBUG) {
                console.warn(`Couldn't find one or more element in the document at '${location}'. Opening the link directly.`);
            }
            // To open the link directly, we first pop one entry off the browser history.
            // We have to do this because (some) browsers won't handle the back button correctly otherwise.
            // We then wait for a short time and change the document's location.
            // TODO: If we didn't call `pushState` optimistically we wouldn't have to do this.
            window.history.back();
            setTimeout(() => document.location.assign(url), 100);
            // If it's a different error, throw the generic `error` event.
        }
        else {
            if (process.env.DEBUG)
                console.error(context);
            this.parent.fireEvent('error', { detail: context });
        }
    }
    emitNetworkError(context) {
        if (process.env.DEBUG)
            console.error(context);
        this.parent.fireEvent('networkerror', { detail: context });
    }
    emitError(context) {
        if (process.env.DEBUG)
            console.error(context);
        this.parent.fireEvent('error', { detail: context });
    }
    emitReady(context) {
        this.parent.fireEvent('ready', { detail: context });
    }
    emitAfter(context) {
        this.parent.fireEvent('after', { detail: context });
    }
    emitProgress(context) {
        this.parent.fireEvent('progress', { detail: context });
    }
    emitLoad(context) {
        this.parent.fireEvent('load', { detail: context });
    }
}
;
