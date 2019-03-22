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
        this.parent.start.emit(Object.assign({}, context, { transitionUntil }));
    }
    emitDOMError(context) {
        console.log(context.error);
        const { replaceElMissing, url } = context;
        if (replaceElMissing) {
            window.history.back();
            setTimeout(() => (document.location.href = url), 100);
        }
        else {
            this.parent.error.emit(context);
        }
    }
    emitNetworkError(context) {
        this.parent.networkerror.emit(context);
    }
    emitError(context) {
        console.log(context.error);
        this.parent.error.emit(context);
    }
    emitReady(context) {
        this.parent.ready.emit(context);
    }
    emitAfter(context) {
        this.parent.after.emit(context);
    }
    emitProgress(context) {
        this.parent.progress.emit(context);
    }
    emitLoad(context) {
        this.parent.load.emit(context);
    }
}
;
