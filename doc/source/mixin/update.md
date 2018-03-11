# src / mixin / update.js
Copyright (c) 2018 Florian Klampfer <https://qwtel.com/>

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

import { fragmentFromString } from '../common';

import { PUSH } from './constants';
import { tempRemoveScriptTags } from './script-hack';
```

For convenience....


```js
const assign = Object.assign.bind(Object);
```

Extracts the title of the page


```js
export function getTitle(fragment) {
  return (fragment.querySelector('title') || {}).textContent;
}
```

Extracts the elements to be replaced


```js
export function getReplaceElements(fragment) {
  if (this.replaceIds.length > 0) {
    return this.replaceIds.map(id => fragment.getElementById(id));
  } else if (this.el.id) {
    return [fragment.getElementById(this.el.id)];
  } else {
    const index = Array.from(document.getElementsByTagName(this.el.tagName)).indexOf(this.el);
    return [fragment.querySelectorAll(this.el.tagName)[index]];
  }
}
```

Takes the response string and turns it into document fragments
that can be inserted into the DOM.


```js
export function responseToContent(context) {
  const { response } = context;

  const fragment = fragmentFromString(response);
  const title = getTitle.call(this, fragment);
  const replaceEls = getReplaceElements.call(this, fragment);

  if (replaceEls.some(x => x == null)) {
    throw assign(context, { replaceElMissing: true });
  }

  const scripts = this.scriptSelector
    ? tempRemoveScriptTags.call(this, replaceEls)
    : [];

  return assign(context, { title, replaceEls, scripts });
}
```

Replaces the old elments with the new one, one-by-one.


```js
function replaceContentByIds(elements) {
  this.replaceIds
    .map(id => document.getElementById(id))
    .forEach((oldElement, i) => {
      oldElement.parentNode.replaceChild(elements[i], oldElement);
    });
}
```

When no `relaceIds` are set, replace the entire content of the component (slow).


```js
function replaceContentWholesale([el]) {
  this.el.innerHTML = el.innerHTML;
}
```

TODO: doc


```js
function replaceContent(replaceEls) {
  if (this.replaceIds.length > 0) {
    replaceContentByIds.call(this, replaceEls);
  } else {
    replaceContentWholesale.call(this, replaceEls);
  }
}
```

TODO: doc


```js
export function updateDOM(context) {
  try {
    const { title, replaceEls, type } = context;

    document.title = title;

    if (type === PUSH) {
      window.history.replaceState(window.history.state, title, window.location);
    }

    replaceContent.call(this, replaceEls);
  } catch (error) {
    throw assign(context, { error });
  }
}
```


