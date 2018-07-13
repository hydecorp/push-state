# src / mixin / operators.js
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

import { NEVER } from "rxjs/_esm5";

import { switchMap } from "rxjs/_esm5/operators";
```

### Observable extensions
#### Unsubscribe when
This operator unsubscribes from the source observable when `pauser$` emits a truthy value,
and re-subscribes when it emits a falsy value.


```js
export const unsubscribeWhen = pauser$ => source => {
  if (process.env.DEBUG && !pauser$) throw Error();
  return pauser$.pipe(switchMap(paused => (paused ? NEVER : source)));
};
```

#### Custom subscribe
A custom subscribe function that will `recover` from an error and log it to the console.
This is a line of last defense to make sure the entire pipeline/page doesn't crash.


```js
/*
function subscribe(ne, er, co) {
  let res = this;
  if (process.env.DEBUG) res = this.pipe(tap({ error: e => console.error(e) }));
  return res
    .pipe(catchError((e, c) => c))
    .subscribe(ne, er, co);
}
*/
```


