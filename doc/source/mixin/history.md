# src / mixin / history.js
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

## Overview
This file contains helper funtions related to managing the History API.

## Imports


```js
import { isExternal } from "../common";

import { PUSH, POP, INIT } from "./constants";
import { scrollMixin } from "./scrolling";

export const historyMixin = C =>
  class extends scrollMixin(C) {
```

## Update History state
add a new entry on the history stack, assuming the href is differnt.


```js
    updateHistoryState({ type, replace, url: { href } }) {
      if (isExternal(this)) return;

      switch (type) {
        case INIT:
        case PUSH: {
          const id = this.histId();
          const method = replace || href === window.location.href ? "replaceState" : "pushState";
          const state = Object.assign(window.history.state || {}, { [id]: {} });
          window.history[method](state, document.title, href);
        }
        case POP:
          break;
        default: {
          if (process.env.DEBUG) console.warn(`Type '${type}' not reconginzed?`);
          break;
        }
      }
    }
```

FIXME: use one updatehistory state function for both?


```js
    updateHistoryStateHash({ type, url }) {
      if (isExternal(this)) return; // TODO: abort or not?

      if (type === PUSH) {
        const id = this.histId();
        window.history.pushState({ [id]: {} }, document.title, url);
      }
    }

    updateHistoryTitle({ type, title }) {
      document.title = title;

      if (!isExternal(this) && type === PUSH)
        window.history.replaceState(window.history.state, title, window.location);
    }

    saveScrollPosition() {
      if (isExternal(this)) return;

      const state = this.assignScrollPosition(window.history.state || {});
      window.history.replaceState(state, document.title, window.location);
    }
  };
```


