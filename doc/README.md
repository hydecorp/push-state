# Documentation

* [Options](options.md)
* [Methods](methods.md)
* [Events](events.md)

## Usage
**hy-push-state** can be used in a variety of ways:
* As [Web Component](#web-component), both as *ES6 Module* and *HTML Import*
* As [jQuery](#jquery)
* As [Vanilla](#vanilla) JavaScript class
* (Advanced) Possibly as part of your own component hierarchy as [ES6 Mixin][esmixins].
* (Advanced) As part of your bundled frontend code.

[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

### Web Component
The Web Component is the preferred way of using **hy-push-state**, but requires Web Component [support] in the browser or a [polyfill].

[support]: https://caniuse.com/#feat=template,custom-elementsv1,shadowdomv1,es6-module,imports
[polyfill]: https://github.com/webcomponents/webcomponentsjs

#### Bundled ES6 Module
This is the version that is going to have native support across all major browsers the soonest.

~~~html
<script type="module" href="https://unpkg.com/hy-push-state/dist/webcomponent/module.js"></script>

<hy-push-state link-selector="a[href]"><!--content--></hy-push-state>
~~~

#### HTML Import
Some browsers have decided against implementing HTML Imports, but they are easily polyfilled.

~~~html
<link rel="import" href="https://unpkg.com/hy-push-state/dist/webcomponent/hy-push-state.html">

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
<script src="https://unpkg.com/hy-push-state/dist/jquery"></script>
<script>
  $('#pushStateEl').pushstate()
</script>
~~~

### Vanilla
~~~html
<div id="pushStateEl"><!--content--></div>

<script src="https://unpkg.com/hy-push-state/dist/vanilla"></script>
<script>
  var HyPushState = window.hyPushState.HyPushState;
  var pushState = new HyPushState(window.pushStateEl, {
    linkSelector: 'a[href]',
  });
</script>
~~~

## Size
The size of the minified bundle hovers around 90kb, or ~20kb gzipped.

| File | Size |
|:-----|-----:|
| `dist/jquery/index.js` | 340K |
| `dist/jquery/index.min.js` |  89K |
| `dist/mixin/index.js` | 329K |
| `dist/mixin/index.min.js` |  85K |
| `dist/vanilla/index.js` | 332K |
| `dist/vanilla/index.min.js` |  86K |
| `dist/webcomponent/html-import.js` | 342K |
| `dist/webcomponent/html-import.min.js` |  90K |
| `dist/webcomponent/index.js` | 342K |
| `dist/webcomponent/index.min.js` |  90K |
| `dist/webcomponent/module.js` | 343K |
| `dist/webcomponent/module.min.js` |  90K |


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

[rxjs]: https://github.com/ReactiveX/rxjs
