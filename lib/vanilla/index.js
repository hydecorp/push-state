'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushState = exports.VANILLA_FEATURE_TESTS = undefined;

require('core-js/fn/array/from');

var _vanilla = require('hy-component/src/vanilla');

var _mixin = require('../mixin');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // # src / vanilla / index.js
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

var VANILLA_FEATURE_TESTS = exports.VANILLA_FEATURE_TESTS = _mixin.MIXIN_FEATURE_TESTS;

var PushState = exports.PushState = function (_pushStateMixin) {
  _inherits(PushState, _pushStateMixin);

  function PushState() {
    _classCallCheck(this, PushState);

    return _possibleConstructorReturn(this, (PushState.__proto__ || Object.getPrototypeOf(PushState)).apply(this, arguments));
  }

  return PushState;
}((0, _mixin.pushStateMixin)(_vanilla.VanillaComponent));