'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HTMLPushStateElement = exports.WEBCOMPONENT_FEATURE_TESTS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('core-js/fn/array/from');

var _customElement = require('hy-component/src/custom-element');

var _symbols = require('hy-component/src/symbols');

var _qdSet = require('qd-set');

var _mixin = require('../mixin');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // # src / webcomponent / index.js
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

var WEBCOMPONENT_FEATURE_TESTS = exports.WEBCOMPONENT_FEATURE_TESTS = new _qdSet.Set([].concat(_toConsumableArray(_customElement.CUSTOM_ELEMENT_FEATURE_TESTS), _toConsumableArray(_mixin.MIXIN_FEATURE_TESTS)));

var HTMLPushStateElement = exports.HTMLPushStateElement = function (_customElementMixin) {
  _inherits(HTMLPushStateElement, _customElementMixin);

  function HTMLPushStateElement() {
    _classCallCheck(this, HTMLPushStateElement);

    return _possibleConstructorReturn(this, (HTMLPushStateElement.__proto__ || Object.getPrototypeOf(HTMLPushStateElement)).apply(this, arguments));
  }

  _createClass(HTMLPushStateElement, [{
    key: _symbols.sGetTemplate,
    value: function value() {
      return null;
    }
  }], [{
    key: 'observedAttributes',
    get: function get() {
      return this.getObservedAttributes();
    }
  }]);

  return HTMLPushStateElement;
}((0, _customElement.customElementMixin)((0, _mixin.pushStateMixin)(_customElement.CustomElement)));