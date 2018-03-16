# Documentation

* [Options](options.md){:.flip-title}
* [Methods](methods.md){:.flip-title}
* [Events](events.md){:.flip-title}

## Usage
### Web Component
The Web Component is the preferred way of using **hy-push-state**, but requires Web Component support in the browser or a [polyfill](https://github.com/webcomponents/webcomponentsjs).

#### Bundled ES6 Module
This is the version that is going to have native support across all major browsers the soonest.

~~~html
<script type="module" href="https://unpkg.com/hy-push-state/dist/webcomponent/hy-push-state-module.min.js"></script>

<hy-push-state link-selector="a[href]"><!--content--></hy-push-state>
~~~

#### HTML Import
Some browsers have put support for HTML Imports on hold, but it is easily polyfilled.

~~~html
<link rel="import" href="https://unpkg.com/hy-push-state/dist/webcomponent/hy-push-state.min.html">

<hy-push-state link-selector="a[href]"><!--content--></hy-push-state>
~~~

#### Unbundled ES6 Module (experimental)
The unpkg CDN can rewrite all "bare" import paths with valid unpkg URLs by passing the `?module` query parameter.
This allows importing **hy-push-state**'s source directly.
Note that this will result in possibly hundreds of separate requests.

~~~html
<script>window.process = { env: { DEBUG: true } };</script>
<script type="module" src="https://unpkg.com/hy-push-state/src/webcomponent/module?module"></script>

<hy-push-state link-selector="a[href]"><!--content--></hy-push-state>
~~~

### jQuery

~~~html
<div id="pushStateEl" data-link-selector="a[href]"><!--content--></div>

<script src="https://unpkg.com/jquery/dist/jquery.min.js"></script>
<script src="https://unpkg.com/hy-push-state/dist/jquery/hy-push-state.min.js"></script>
<script>
  $('#pushStateEl').pushstate()
</script>
~~~

### Vanilla
~~~html
<div id="pushStateEl"><!--content--></div>

<script src="https://unpkg.com/hy-push-state/dist/vanilla/hy-push-state.min.js"></script>
<script>
  var HyPushState = window.hyPushState.HyPushState;
  var pushState = new HyPushState(window.pushStateEl, {
    linkSelector: 'a[href]',
  });
</script>
~~~


## Size
The size of the minified bundle hovers around 80kb, or ~19kb gziped.

```
320K dist/jquery/hy-push-state.js
 79K dist/jquery/hy-push-state.min.js
309K dist/mixin/hy-push-state.js
 76K dist/mixin/hy-push-state.min.js
312K dist/vanilla/hy-push-state.js
 76K dist/vanilla/hy-push-state.min.js
322K dist/webcomponent/hy-push-state-html-import.js
 81K dist/webcomponent/hy-push-state-html-import.min.js
323K dist/webcomponent/hy-push-state-module.js
 81K dist/webcomponent/hy-push-state-module.min.js
322K dist/webcomponent/hy-push-state.js
 81K dist/webcomponent/hy-push-state.min.js
```


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
