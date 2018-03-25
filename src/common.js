// # src / common.js
// Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

export const matches =
  Element.prototype.matches ||
  Element.prototype.matchesSelector ||
  Element.prototype.msMatchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.oMatchesSelector;

// Checks if this element or any of its parents matches a given `selector`.
export function matchesAncestors(selector) {
  let curr = this;
  while (curr !== document && curr !== document.documentElement) {
    if (matches.call(curr, selector)) return curr;
    curr = curr.parentNode;
  }
  return null;
}

// Consider a URL external if either the protocol, hostname or port is different.
export function isExternal({ protocol, host }, location = window.location) {
  return protocol !== location.protocol || host !== location.host;
}

export function isHash({ hash, origin, pathname }, location = window.location) {
  return hash !== "" && origin === location.origin && pathname === location.pathname;
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
