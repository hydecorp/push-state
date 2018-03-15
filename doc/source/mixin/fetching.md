# src / mixin / fetching.js
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
This file contains helper functions related to fetching new content.

## Imports


```js
import { of } from 'rxjs/_esm5/observable/of';

import { map } from 'rxjs/_esm5/operators/map';
import { take } from 'rxjs/_esm5/operators/take';
import { zip } from 'rxjs/_esm5/operators/zip';
```

For convenience....


```js
const assign = Object.assign.bind(Object);
```

## Fetching


```js
export function hrefToAjax({ url }) {
  return {
    method: 'GET',
    responseType: 'text',
    url,
  };
}
```

The `ajax` method will throw when it encoutners an a 400+ status code,
however these are still valid responses from the server that can be shown using this component.
This assumes error pages have the same HTML strcuture as the other pages though.


```js
export function recoverIfResponse(context, error) {
  const { status, xhr } = error;
```

If we have a response, recover and continue with the pipeline.


```js
  if (xhr && xhr.response && status > 400) {
    return of(assign(context, { response: xhr.response }));
  }
```

If we don't have a response, this is an acutal error that should be dealt with.


```js
  return of(assign(context, { error }));
}
```

This function returns the request that matches a given URL.
The way the pipeline is set up,
it is either the `latestPrefetch` value (when the request is already completed),
or the next value on the prefetch observable (when still in progress).


```js
function getFetch$({ url: { href } }, latestPrefetch, prefetch$) {
  return href === latestPrefetch.url.href && latestPrefetch.error == null
    ? of(latestPrefetch)
    : prefetch$.pipe(take(1));
}
```

Returns an observable that emits exactly one notice, which contains the response.
It will not emit until an (optional) page transition animation completes.


```js
export function getResponse(prefetch$, [context, latestPrefetch]) {
  return getFetch$(context, latestPrefetch, prefetch$).pipe(
    map(fetch => assign(fetch, context)),
    zip(this.animPromise, x => x),
  );
}
```


