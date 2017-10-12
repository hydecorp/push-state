# Methods

* toc
{:toc}

## `assign`
Mimics the browser [`assign`](https://developer.mozilla.org/en-US/docs/Web/API/Location/assign) method.
Will attempt to dynamically replace the current content with the content of the document at the provided URL.

## `reload`
Mimics the browser [`reload`](https://developer.mozilla.org/en-US/docs/Web/API/Location/reload) method.

## `relpace`
Mimics the browser [`replace`](https://developer.mozilla.org/en-US/docs/Web/API/Location/replace) method,
similar to [`assign`](#assign), but will not push a new entry on the browser's history stack.
