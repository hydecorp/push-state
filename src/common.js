// Copyright (c) 2017 Florian Klampfer
// Licensed under MIT

import { Observable } from 'rxjs/Observable';

/**
 * Checks to see if the url is external
 *
 * @param   {string}    url - url being evaluated
 * @see     http://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
 */
export function isExternal(url) {
  const match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/); // eslint-disable-line no-useless-escape

  if (typeof match[1] === 'string' &&
      match[1].length > 0 &&
      match[1].toLowerCase() !== window.location.protocol
    ) {
    return true;
  }

  const port = { http: 80, https: 443 }[window.location.protocol];

  if (typeof match[2] === 'string' &&
    match[2].length > 0 &&
    match[2].replace(new RegExp(`:(${port})?$`), '') !== window.location.host) {
    return true;
  }

  return false;
}

/**
 * Strips the hash from a url and returns the new href
 *
 * @param   {string}    href - url being evaluated
 */
export function stripHash(href) {
  return href.replace(/#.*/, '');
}

/**
 * Checks to see if the url is an internal hash
 *
 * @param   {string}    href - url being evaluated
 * @param   {string}    prev - previous url (optional)
 */
export function isHash(href, prev) {
  const p = prev || window.location.href;

  const hasHash = href.indexOf('#') > -1;
  const samePath = stripHash(href) === stripHash(p);

  return (hasHash && samePath);
}

export function matches(el, selector) {
  return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector ||
    el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  // if (!matches.memo) {
  //   matches.memo =
  //     el.matches ||
  //     el.matchesSelector ||
  //     el.msMatchesSelector ||
  //     el.mozMatchesSelector ||
  //     el.webkitMatchesSelector ||
  //     el.oMatchesSelector;
  // }
  // return matches.memo.call(el, selector);
}

export function querySelectorInv(el, selector) {
  let curr = el;
  while (curr !== document && curr !== document.documentElement) {
    if (matches(curr, selector)) return curr;
    curr = curr.parentNode;
  }
  return null;
}

/**
 * Checks to see if we should be loading this URL
 *
 * @param   {string}    url - url being evaluated
 * @param   {string}    blacklist - jquery selector
 */
export function shouldLoadAnchor(anchor, blacklist, hrefRegex) {
  const href = anchor.href;
  // URL will only be loaded if it's not an external link, hash, or
  // blacklisted
  return (
    !isExternal(href) &&
    !isHash(href) &&
    !matches(anchor, blacklist) &&
    anchor.target === '' && (
      hrefRegex === null ||
      href.search(hrefRegex) !== -1
    )
  );
}

export function getScrollHeight() {
  const h = document.documentElement;
  const b = document.body;
  const sh = 'scrollHeight';
  return h[sh] || b[sh];
}

export function getScrollLeft() {
  return window.pageXOffset || document.body.scrollLeft;
}

export function getScrollTop() {
  return window.pageYOffset || document.body.scrollTop;
}

export function expInterval(init, exp) {
  return Observable.create((observer) => {
    let n = init;
    let id;

    function next() {
      observer.next(n);
      n *= exp;
      id = setTimeout(next, n);
    }

    id = setTimeout(next, n);

    return () => {
      clearTimeout(id);
    };
  });
}

export function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}
