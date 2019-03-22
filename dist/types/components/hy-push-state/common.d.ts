import { Observable } from 'rxjs';
export declare enum Cause {
    Init = "init",
    Hint = "hint",
    Push = "push",
    Pop = "pop"
}
export interface Context {
    cause: Cause;
    url: URL;
    cacheNr?: number;
    replace?: boolean;
    error?: any;
    anchor?: HTMLAnchorElement;
}
export interface ClickContext extends Context {
    event: MouseEvent;
}
export declare function subscribeWhen<T>(p$: Observable<boolean>): (source: Observable<T>) => Observable<T>;
export declare function unsubscribeWhen<T>(p$: Observable<boolean>): (source: Observable<T>) => Observable<T>;
export declare function fetchRx(input: RequestInfo, init?: RequestInit): Observable<Response>;
export declare function isExternal({ protocol, host }: {
    protocol: string;
    host: string;
}, location?: {
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
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export declare function getScrollHeight(): number;
export declare function getScrollLeft(): number;
export declare function getScrollTop(): number;
export declare function fragmentFromString(strHTML: any): DocumentFragment;
export declare function matchesAncestors(el: Element, selector: string): Element | null;
export declare function createMutationObservable(el: HTMLElement, options?: MutationObserverInit): Observable<MutationRecord>;
export declare function shouldLoadAnchor(anchor: HTMLAnchorElement): boolean;
export declare function isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }: ClickContext, location: Location): boolean;
export declare function isHintEvent({ url, anchor }: Context, location: Location): boolean;
export declare function isHashChange({ url: { pathname: prevPathname } }: Context, { url: { pathname, hash }, cause }: Context): boolean;
