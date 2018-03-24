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

import { PUSH, INIT } from "./constants";
import { scrollMixin } from "./scrolling";

export const historyMixin = C =>
  class extends scrollMixin(C) {
```

## Update History state
add a new entry on the history stack, assuming the href is differnt.


```js
    updateHistoryState({ type, replace, url: { href, hash } }) {
      if ((type === PUSH || type === INIT) && !isExternal(this)) {
        const id = this.histId();
        const method =
          replace || href === window.location.href
            ? "replaceState"
            : "pushState";
        const state = Object.assign(window.history.state || {}, {
          [id]: { hash: !!hash }
        });
        window.history[method](state, document.title, href);
      }
    }

    updateHistoryStateHash({ type, url }) {
      const { hash, href } = url;

      if (type === PUSH && !isExternal(this)) {
        const id = this.histId();
        const currState = Object.assign(window.history.state, {
          [id]: Object.assign(window.history.state[id], { hash: true })
        });
        const nextState = {
          [id]: { hash: true }
        };
        window.history.replaceState(
          currState,
          document.title,
          window.location.href
        );
        window.history.pushState(nextState, document.title, href);
      }

      this.scrollHashIntoView(hash);
    }

    updateHistoryTitle({ type, title }) {
      document.title = title;

      if (type === PUSH && !isExternal(this)) {
        window.history.replaceState(
          window.history.state,
          title,
          window.location
        );
      }
    }

    saveScrollHistoryState() {
      if (isExternal(this)) return;

      const state = this.saveScrollPosition(window.history.state || {});
      window.history.replaceState(state, document.title, window.location);
    }
  };
```


