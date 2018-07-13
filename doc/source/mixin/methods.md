# src / mixin / methods.js
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

import { isExternal, isHash } from "../common";

import { PUSH, POP } from "./constants";
```

## Functions
What you will notice about the following helper functions is that many make reference to `this`.
This is because they are invoked with the `::` operator, binding `this` to the component,
effectively turning them into (private) methods. Since the final export is a mixin,
we want to avoid potentially conflicting names as much as possible.


```js

export const helperMixin = C =>
  class extends C {
```

Returns an identifier to mark frames on the history stack.


```js
    histId() {
      return this.el.id || this.constructor.componentName;
    }
```

### Event filters


```js
    shouldLoadAnchor(anchor, hrefRegex) {
      return anchor && anchor.target === "" && (!hrefRegex || anchor.href.search(hrefRegex) !== -1);
    }

    isPushEvent({ url, anchor, event: { metaKey, ctrlKey } }) {
      return (
        !metaKey &&
        !ctrlKey &&
        this.shouldLoadAnchor(anchor, this.hrefRegex) &&
        !isExternal(url, this)
      );
    }

    isHintEvent({ url, anchor }) {
      return (
        this.shouldLoadAnchor(anchor, this.hrefRegex) &&
        !isExternal(url, this) &&
        !isHash(url, this)
      );
    }
```

Determines if a pair of context's constitutes a hash change (vs. a page chagne)
We take as a hash change when the pathname of the URLs is the same,
and the `hash` isn't empty.


```js
    isHashChange([
      {
        url: { pathname: prevPathname },
      },
      {
        url: { pathname, hash },
        type,
      },
    ]) {
      return pathname === prevPathname && (type === POP || (type === PUSH && hash !== ""));
    }
  };
```


