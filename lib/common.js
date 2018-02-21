'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matches = exports.Set = undefined;
exports.matchesAncestors = matchesAncestors;
exports.isExternal = isExternal;
exports.isHash = isHash;
exports.getScrollHeight = getScrollHeight;
exports.getScrollLeft = getScrollLeft;
exports.getScrollTop = getScrollTop;
exports.fragmentFromString = fragmentFromString;

var _qdSet = require('qd-set');

exports.Set = _qdSet.Set; // # src / common.js
// Copyright (c) 2017 Florian Klampfer <https://qwtel.com/>
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

var matches = exports.matches = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.oMatchesSelector;

// Checks if this element or any of its parents matches a given `selector`.
function matchesAncestors(selector) {
  var curr = this;
  while (curr !== document && curr !== document.documentElement) {
    var _context;

    if ((_context = curr, matches).call(_context, selector)) return curr;
    curr = curr.parentNode;
  }
  return null;
}

// Consider a URL external if either the protocol, hostname or port is different.
function isExternal(_ref) {
  var protocol = _ref.protocol,
      host = _ref.host;

  return protocol !== window.location.protocol || host !== window.location.host;
}

function isHash(_ref2) {
  var hash = _ref2.hash,
      origin = _ref2.origin,
      pathname = _ref2.pathname;

  return hash !== '' && origin === window.location.origin && pathname === window.location.pathname;
}

function getScrollHeight() {
  var h = document.documentElement;
  var b = document.body;
  var sh = 'scrollHeight';
  return h[sh] || b[sh];
}

function getScrollLeft() {
  return window.pageXOffset || document.body.scrollLeft;
}

function getScrollTop() {
  return window.pageYOffset || document.body.scrollTop;
}

function fragmentFromString(strHTML) {
  return document.createRange().createContextualFragment(strHTML);
}