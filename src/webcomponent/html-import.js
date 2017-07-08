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

import { customElementMixin, CustomElement } from 'y-component/src/custom-element';
import { pushStateMixin } from '../mixin';

if ('customElements' in window) {
  customElements.define('y-push-state', customElementMixin(pushStateMixin(CustomElement)));
} else if (process.env.DEBUG) {
  console.warn('Couldn\'t register y-drawer component. Did you forget to include the custom elements polyfill?');
}
