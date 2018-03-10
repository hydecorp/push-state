# Documentation

* [Options](options.md)
* [Methods](methods.md)
* [Events](events.md)


## Gold Standard
This component follows the Web Components [Gold Standard](gold-standard.md){:.flip-title}.


## Source
The source code is written in a *literal programming* style, and should be reasonably approachable.
However, some knowledge of [RxJS] is required.

The core functionality is implemented in [`mixin / index.js`](source/mixin/index.md),
which is used to create the framework-specific versions of the component.

* `jquery`
  * [`index.js`](source/jquery/index.md)
* `mixin`
  * [`constants.js`](source/mixin/constants.md)
  * [`events.js`](source/mixin/events.md)
  * [`fetching.js`](source/mixin/fetching.md)
  * [`history.js`](source/mixin/history.md)
  * [`index.js`](source/mixin/index.md)
  * [`methods.js`](source/mixin/methods.md)
  * [`operators.js`](source/mixin/operators.md)
  * [`script-hack.js`](source/mixin/script-hack.md)
  * [`scrolling.js`](source/mixin/scrolling.md)
  * [`setup.js`](source/mixin/setup.md)
  * [`update.js`](source/mixin/update.md)
* `vanilla`
  * [`index.js`](source/vanilla/index.md)
* `webcomponent`
  * [`html-import.s`](source/webcomponent/html-import.md)
  * [`index.js`](source/webcomponent/index.md)
  * [`module.js`](source/webcomponent/module.md)
* [`common.js`](source/common.md)
* [`index.js`](source/index.md)
* [`url.js`](source/url.md)
