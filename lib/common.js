export { applyMixins, subscribeWhen, unsubscribeWhen, filterWhen, bufferDebounceTime, fetchRx, fragmentFromString, createMutationObservable, getScrollHeight, getScrollLeft, getScrollTop, matches, matchesAncestors } from '@hydecorp/component';
export var Cause;
(function (Cause) {
    Cause["Init"] = "init";
    Cause["Hint"] = "hint";
    Cause["Push"] = "push";
    Cause["Pop"] = "pop";
})(Cause || (Cause = {}));
;
export function isExternal(url, location = window.location) {
    return url != null && (url.protocol !== location.protocol || url.host !== location.host);
}
export function isHash({ hash, origin, pathname }, location = window.location) {
    return hash !== "" && origin === location.origin && pathname === location.pathname;
}
export function shouldLoadAnchor(anchor) {
    return anchor && anchor.target === "";
}
export function isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }, location) {
    return !!(!metaKey &&
        !ctrlKey &&
        shouldLoadAnchor(anchor) &&
        !isExternal(url, location));
}
export function isHintEvent({ url, anchor }, location) {
    return !!(shouldLoadAnchor(anchor) &&
        !isExternal(url, location) &&
        !isHash(url, location));
}
export function isHashChange({ cause, url: { pathname, hash }, oldURL, }) {
    return pathname === (oldURL === null || oldURL === void 0 ? void 0 : oldURL.pathname) && (cause === Cause.Pop || (cause === Cause.Push && hash !== ''));
}
//# sourceMappingURL=common.js.map