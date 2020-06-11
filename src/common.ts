export {
  applyMixins,
  subscribeWhen,
  unsubscribeWhen,
  filterWhen,
  bufferDebounceTime,
  fetchRx,
  fragmentFromString,
  createMutationObservable,
  getScrollHeight,
  getScrollLeft,
  getScrollTop,
  matches,
  matchesAncestors
} from '@hydecorp/component';

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
