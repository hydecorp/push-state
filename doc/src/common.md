# common.js
Copyright (c) 2017 Florian Klampfer <https://qwtel.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Observable } from 'rxjs/Observable';


```js

export const matches =
  Element.prototype.matches ||
  Element.prototype.matchesSelector ||
  Element.prototype.msMatchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.oMatchesSelector;

export function matchesAncestors(selector) {
  let curr = this;
  while (curr !== document && curr !== document.documentElement) {
    if (curr::matches(selector)) return curr;
    curr = curr.parentNode;
  }
  return null;
}
```

If you consider a URL being external if either the protocol, hostname or port is different.


```js
export function isExternal({ protocol, host }) {
  return protocol !== window.location.protocol
    && host !== window.location.host;
}

export function isHash({ hash, origin, pathname }) {
  return hash !== ''
    && origin === window.location.origin
    && pathname === window.location.pathname;
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

export function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}
```

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


