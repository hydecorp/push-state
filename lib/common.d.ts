export { applyMixins, subscribeWhen, unsubscribeWhen, filterWhen, bufferDebounceTime, fetchRx, fragmentFromString, createMutationObservable, getScrollHeight, getScrollLeft, getScrollTop, matches, matchesAncestors } from '@hydecorp/component';
export declare enum Cause {
    Init = "init",
    Hint = "hint",
    Push = "push",
    Pop = "pop"
}
export interface Context {
    cause: Cause;
    url: URL;
    oldURL?: URL;
    cacheNr?: number;
    replace?: boolean;
    error?: any;
    anchor?: HTMLAnchorElement;
}
export interface ClickContext extends Context {
    event: MouseEvent;
}
export declare function isExternal(url?: {
    protocol: string;
    host: string;
} | null, location?: {
    protocol: string;
    host: string;
}): boolean;
export declare function isHash({ hash, origin, pathname }: {
    hash: string;
    origin: string;
    pathname: string;
}, location?: {
    hash: string;
    origin: string;
    pathname: string;
}): boolean;
export declare function shouldLoadAnchor(anchor?: HTMLAnchorElement | null): boolean | null | undefined;
export declare function isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }: ClickContext, location: Location): boolean;
export declare function isHintEvent({ url, anchor }: Context, location: Location): boolean;
export declare function isHashChange({ cause, url: { pathname, hash }, oldURL, }: Context): boolean;
//# sourceMappingURL=common.d.ts.map