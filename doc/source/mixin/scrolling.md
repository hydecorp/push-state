# src / mixin / scrolling.js
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

import { getScrollTop, getScrollHeight } from "../common";

import { PUSH, POP } from "./constants";
```

### Managing scroll positions
The following functions deal with managing the scroll position of the site.


```js

export const scrollMixin = C =>
  class extends C {
```

TODO: doc


```js
    assignScrollPosition(state) {
      const id = this.histId();
      return Object.assign(state, {
        [id]: Object.assign(state[id] || {}, {
          scrollTop: getScrollTop(),
          scrollHeight: getScrollHeight(),
        }),
      });
    }
```

TODO


```js
    manageScrollPostion({ type, url: { hash } }) {
      switch (type) {
        case PUSH:
```

FIXME: make configurable


```js
          this.scrollHashIntoView(hash, { behavior: "smooth", block: "start", inline: "nearest" });
          break;
        case POP: {
          this.restoreScrollPostion();
          break;
        }
        case INIT:
          break;
        default: {
          if (process.env.DEBUG) console.warn(`Type '${type}' not reconginzed.`);
          break;
        }
      }
    }
```

Given a hash, find the element of the same id on the page, and scroll it into view.
If no hash is provided, scroll to the top instead.


```js
    scrollHashIntoView(hash, options) {
      if (hash) {
        const el = document.getElementById(decodeURIComponent(hash.substr(1)));
        if (el) el.scrollIntoView(options);
        else if (process.env.DEBUG) console.warn(`Can't find element with id ${hash}`);
      } else {
        window.scroll(window.pageXOffset, 0);
      }
    }
```

Takes the current history state, and restores the scroll position.


```js
    restoreScrollPostion() {
      const id = this.histId();
      const { scrollTop, scrollHeight } = (window.history.state && window.history.state[id]) || {};

      if (scrollTop != null) {
```

FIXME: Setting `min-height` to ensure that we can scroll back to the previous position?
FIXME: Use `attributeStyleMap`?


```js
        /* document.body.style.minHeight = `${scrollHeight}px`; */
        window.scroll(window.pageXOffset, scrollTop);
      }
    }
```

Only restore position on page reload when the user hasn't started scorlling yet.


```js
    restoreScrollPostionOnReload() {
      const userHasScrolled = getScrollTop() != 0;
      if (!userHasScrolled) this.restoreScrollPostion();
    }
  };
```


