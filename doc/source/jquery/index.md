# src / jquery / index.js
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


```js

import $ from 'jquery';

import { JQueryComponent, defineJQueryComponent, sSetupDOM }
from 'hy-component/src/define-jquery-component';

import { pushStateMixin, MIXIN_FEATURE_TESTS } from '../mixin';
/* import '../style.css'; */

export const JQUERY_FEATURE_TESTS = [
  ...MIXIN_FEATURE_TESTS,
];

export const pushStateJQueryPlugin = defineJQueryComponent('hy.pushState',
  class extends pushStateMixin(JQueryComponent) {
    [sSetupDOM](el) {
      return el;
    }
  },
);
```


