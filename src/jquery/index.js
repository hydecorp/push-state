// # src / jquery / index.js
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

import { JQueryComponent, defineJQueryComponent, setupDOM }
from 'hy-component/src/define-jquery-component';

import { pushStateMixin, MODERNIZR_TESTS as PUSH_STATE_MIXIN_MODERNIZER_TESTS } from '../mixin';
// import '../style.css';

export const MODERNIZR_TESTS = [
  ...PUSH_STATE_MIXIN_MODERNIZER_TESTS,
];

// TODO: rename? check how jQuery UI does it
export const pushStateJQueryPlugin = defineJQueryComponent('pushState',
  class extends pushStateMixin(JQueryComponent) {
    /* @override */
    [setupDOM](el) {
      /* const $el = $(el); */

      // TODO: ....

      return el;
    }
  },
);
