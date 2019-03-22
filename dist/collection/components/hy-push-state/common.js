import { Observable, NEVER } from 'rxjs';
import { switchMap } from 'rxjs/operators';
export var Cause;
(function (Cause) {
    Cause["Init"] = "init";
    Cause["Hint"] = "hint";
    Cause["Push"] = "push";
    Cause["Pop"] = "pop";
})(Cause || (Cause = {}));
;
export function subscribeWhen(p$) {
    return (source) => {
        return p$.pipe(switchMap(p => (p ? source : NEVER)));
    };
}
export function unsubscribeWhen(p$) {
    return (source) => {
        return p$.pipe(switchMap(p => (p ? NEVER : source)));
    };
}
export function fetchRx(input, init) {
    return Observable.create((observer) => {
        const controller = new AbortController();
        const { signal } = controller;
        let response = null;
        fetch(input, Object.assign({}, init, { signal }))
            .then(r => {
            response = r;
            observer.next(r);
            observer.complete();
        })
            .catch(x => observer.error(x));
        return () => { if (!response)
            controller.abort(); };
    });
}
export function isExternal({ protocol, host }, location = window.location) {
    return protocol !== location.protocol || host !== location.host;
}
export function isHash({ hash, origin, pathname }, location = window.location) {
    return hash !== "" && origin === location.origin && pathname === location.pathname;
}
export function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
export function getScrollHeight() {
    const h = document.documentElement;
    const b = document.body;
    const sh = "scrollHeight";
    return h[sh] || b[sh];
}
export function getScrollLeft() {
    return window.pageXOffset || document.body.scrollLeft;
}
export function getScrollTop() {
    return window.pageYOffset || document.body.scrollTop;
}
export function fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
}
export function matchesAncestors(el, selector) {
    let curr = el;
    while (curr != null) {
        if (curr.matches(selector))
            return curr;
        curr = curr.parentNode instanceof Element ? curr.parentNode : null;
    }
    return null;
}
export function createMutationObservable(el, options) {
    return Observable.create((obs) => {
        const observer = new MutationObserver(xs => xs.forEach(x => obs.next(x)));
        observer.observe(el, options);
        return () => { observer.disconnect(); };
    });
}
export function shouldLoadAnchor(anchor) {
    return anchor && anchor.target === "";
}
export function isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }, location) {
    return (!metaKey &&
        !ctrlKey &&
        shouldLoadAnchor(anchor) &&
        !isExternal(url, location));
}
export function isHintEvent({ url, anchor }, location) {
    return (shouldLoadAnchor(anchor) &&
        !isExternal(url, location) &&
        !isHash(url, location));
}
export function isHashChange({ url: { pathname: prevPathname } }, { url: { pathname, hash }, cause }) {
    return pathname === prevPathname && (cause === Cause.Pop || (cause === Cause.Push && hash !== ''));
}
