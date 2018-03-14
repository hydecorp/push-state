# Documentation

* [Options](options.md){:.flip-title}
* [Methods](methods.md){:.flip-title}
* [Events](events.md){:.flip-title}

## Usage
The most straight-forward way to use **hy-push-state** is by using the vanilla JS version and load it from a CDN:

~~~html
<script src="https://unpkg.com/hy-push-state/dist/vanilla/hy-push-state.min.js"></script>
~~~

~~~html
<main id="pushStateEl"><!--content--></main>
<script>
  var HyPushState = window.hyPushState.HyPushState;
  var pushState = new HyPushState(window.pushStateEl, { /* options */ });
</script>
~~~

This assumes all pages have an element with `id="pushStateEl"`, which will be used for replacement.
You can get more fine-grained control over which elements get replaced with the [`replaceIds` option](doc/options.md#replaceids).


## Gold Standard
This component follows the Web Components [Gold Standard](gold-standard.md){:.flip-title}.


## Source
The source code is written in a *literal programming* style, and should be reasonably approachable.
However, some knowledge of [RxJS] is required.

The core functionality is implemented in [`mixin / index.js`](source/mixin/README.md),
which is used to create the framework-specific versions of the component.

* `jquery`
  * [`index.js`](source/jquery/README.md)
* `mixin`
  * [`constants.js`](source/mixin/constants.md)
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
