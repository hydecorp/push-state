# Documentation

* [Options](options.md)
* [Methods](methods.md)
* [Events](events.md)

## Page Prefetching
**hy-push-state** starts a HTTP request as soon as the user "hints" that he/she is about to open a new page by hovering, focusing, or touching (`touchstart`-ing) a link. If the guess is correct, the request has a 100ms or more head-start, further increasing the perceived speed of your site in addition to the already fast webapp-style page replacing.

Unlike other implementations of this feature, the current prefetch request will be canceled if the user hints at a different link, ensuring that there will be no more than one prefetch request in flight at a time. This avoids clogging up the network with requests that are going to be discarded upon arrival, which is essential when on slow 3G connections.

For example, hovering links in the sidebar on [qwtel.com](https://qwtel.com/hy-push-state/) will produce a timeline like the one below:

![dev console screenshot](../assets/img/prefetching.png){:.lead}
Chrome developer console screenshot of prefetching requests.
{:.figure}

## Advanced Animations
**hy-push-state** allows building advanced page transition animations, like the ones used in [Hydejack](https://qwtel.com/hydejack/variations/) and state-of-the-art web apps. These can be promise-based instead of time-based to account for smaller delays caused by other code, GC interruptions, or slower devices in general

The code for a simple fade-out animation using the [Web Animations API][waapi] may look like:

```js
pushStateEl.addEventListener('hy-push-state-start', ({ detail }) =>
  detail.transitionUntil(new Promise(res =>
    document
      .getElementById('my-content')
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 })
      .addEventListener('finish', res)
  ))
);
```

Time-based animations are possible as well and are configured with the [`duration` option](options.md#duration).

[waapi]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API

## Gold Standard
This component follows the Web Components [Gold Standard](gold-standard.md).

## Source
The source code is written in a *literal programming* style, and should be reasonably approachable.
However, some knowledge of [RxJS] is required.

The core functionality is implemented in [`mixin / index.js`](source/mixin/README.md),
which is used to create the framework-specific versions of the component.

* `jquery`
  * [`index.js`](source/jquery/README.md)
* `mixin`
  * [`constants.js`](source/mixin/constants.md)
  * [`event-listeners.js`](source/mixin/event-listeners.md)
  * [`events.js`](source/mixin/events.md)
  * [`fetching.js`](source/mixin/fetching.md)
  * [`history.js`](source/mixin/history.md)
  * [`index.js`](source/mixin/README.md)
  * [`methods.js`](source/mixin/methods.md)
  * [`operators.js`](source/mixin/operators.md)
  * [`script-hack.js`](source/mixin/script-hack.md)
  * [`scrolling.js`](source/mixin/scrolling.md)
  * [`setup.js`](source/mixin/setup.md)
  * [`update.js`](source/mixin/update.md)
* `vanilla`
  * [`index.js`](source/vanilla/README.md)
* `webcomponent`
  * [`html-import.s`](source/webcomponent/html-import.md)
  * [`index.js`](source/webcomponent/README.md)
  * [`module.js`](source/webcomponent/module.md)
* [`common.js`](source/common.md)
* [`index.js`](source/README.md)
* [`url.js`](source/url.md)

## Size
The size of the minified bundle is around 90kb, or ~20kb gzipped.
The majority of it comes from RxJS. When already using RxJS in your project, or using more than one component of the Hydejack component family, consider using a [frontend bundler](../usage/README.md#bundlers).

| Size | File |
|-----:|:-----|
|  84K | `dist/jquery/index.js` |
|  19K | `dist/jquery/index.js.gz` |
|  80K | `dist/mixin/index.js` |
|  18K | `dist/mixin/index.js.gz` |
|  81K | `dist/vanilla/index.js` |
|  18K | `dist/vanilla/index.js.gz` |
|  86K | `dist/webcomponent/html-import.js` |
|  19K | `dist/webcomponent/html-import.js.gz` |
|  86K | `dist/webcomponent/index.js` |
|  19K | `dist/webcomponent/index.js.gz` |
|  86K | `dist/webcomponent/module.js` |
|  19K | `dist/webcomponent/module.js.gz` |


[rxjs]: https://github.com/ReactiveX/rxjs
