import { Observable, PartialObserver, NEVER } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export enum Cause {
  Init = "init",
  Hint = "hint",
  Push = "push",
  Pop = "pop",
};

export interface Context {
  cause: Cause,
  url: URL,
  oldURL?: URL,
  cacheNr?: number,
  replace?: boolean,
  error?: any,
  anchor?: HTMLAnchorElement,
}

export interface ClickContext extends Context {
  event: MouseEvent,
}

export function subscribeWhen<T>(p$: Observable<boolean>) {
  return (source: Observable<T>) => {
    return p$.pipe(switchMap(p => (p ? source : NEVER)));
  };
}

export function unsubscribeWhen<T>(p$: Observable<boolean>) {
  return (source: Observable<T>) => {
    return p$.pipe(switchMap(p => (p ? NEVER : source)));
  };
}

export function fetchRx(input: RequestInfo, init?: RequestInit): Observable<Response> {
  return Observable.create((observer: PartialObserver<Response>) => {
    const controller = new AbortController();
    const { signal } = controller;

    let response = null;
    fetch(input, { ...init, signal })
      .then(r => {
        response = r;
        observer.next(r);
        observer.complete();
      })
      .catch(x => observer.error(x));

    return () => { if (!response) controller.abort(); };
  });
}

export function isExternal(
  { protocol, host }: { protocol: string, host: string },
  location: { protocol: string, host: string } = window.location,
) {
  return protocol !== location.protocol || host !== location.host;
}

export function isHash(
  { hash, origin, pathname }: { hash: string, origin: string, pathname: string },
  location: { hash: string, origin: string, pathname: string } = window.location,
) {
  return hash !== "" && origin === location.origin && pathname === location.pathname;
}

export function applyMixins<T>(derivedCtor: Constructor<T>, baseCtors: Constructor<any>[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
  return derivedCtor;
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

// Checks if this element or any of its parents matches a given `selector`.
export function matchesAncestors(el: Element, selector: string): Element | null {
  let curr = el;
  while (curr != null) {
    if (curr.matches(selector)) return curr;
    curr = curr.parentNode instanceof Element ? curr.parentNode : null;
  }
  return null;
}

export function createMutationObservable(el: HTMLElement, options?: MutationObserverInit): Observable<MutationRecord> {
  return Observable.create((obs: PartialObserver<MutationRecord>) => {
    const observer = new MutationObserver(xs => xs.forEach(x => obs.next(x)));
    observer.observe(el, options);
    return () => { observer.disconnect(); };
  });
}


export function shouldLoadAnchor(anchor: HTMLAnchorElement) {
  return anchor && anchor.target === "";
}

export function isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }: ClickContext, location: Location) {
  return (
    !metaKey &&
    !ctrlKey &&
    shouldLoadAnchor(anchor) &&
    !isExternal(url, location)
  );
}

export function isHintEvent({ url, anchor }: Context, location: Location) {
  return (
    shouldLoadAnchor(anchor) &&
    !isExternal(url, location) &&
    !isHash(url, location)
  );
}

export function isHashChange({
  cause,
  url: { pathname, hash }, 
  oldURL: { pathname: prevPathname },
}: Context) {
  return pathname === prevPathname && (cause === Cause.Pop || (cause === Cause.Push && hash !== ''));
}