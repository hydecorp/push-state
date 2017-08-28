// # src / vanilla / index.js
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

import { VanillaComponent, setupDOM } from 'hy-component/src/vanilla';
import { pushStateMixin, MODERNIZR_TESTS as PUSH_STATE_MIXIN_MODERNIZER_TESTS } from '../mixin';
/* import '../style.css'; */

export const MODERNIZR_TESTS = [
  ...PUSH_STATE_MIXIN_MODERNIZER_TESTS,
];

export class PushState extends pushStateMixin(VanillaComponent) {
  /* @override */
  [setupDOM](el) {
    if (!el) throw Error('No element provided');
    return el;
  }
}
