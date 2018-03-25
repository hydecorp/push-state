# hy-push-state

[![npm version](https://badge.fury.io/js/hy-push-state.svg)](https://badge.fury.io/js/hy-push-state)

**hy-push-state** is a web component that lets you turn web pages into web apps.
The component dynamically loads new content (formerly known as "ajax") and inserts it into the current page,
without causing Flash of White, Flash of Unstyled Content, etc.

> Turn static web sites into dynamic web apps.
{:.lead}

**hy-push-state** is similar to [pjax] and [smoothState], but offers a more advanced pre-fetching logic and
gives more control over timings to enable custom page transition animations.

**hy-push-state** is used by hundreds of sites as part of the [Hydejack]{:.external} Jekyll theme.

**NOTE**: The current version is a pre-release. The public API may still change in important ways.
{:.message}

[pjax]: https://github.com/defunkt/jquery-pjax
[smoothstate]: https://github.com/miguel-perez/smoothState.js
[rxjs]: https://github.com/ReactiveX/rxjs
[hydejack]: https://qwtel.com/hydejack/

<!--more-->

## Examples
The example below will render on [webcomponents.org](https://www.webcomponents.org/element/qwtel/hy-push-state):

<!--
```
<custom-element-demo>
  <template>
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs@1.1.0"></script>
    <link rel="import" href="https://unpkg.com/hy-push-state/dist/webcomponent/hy-push-state.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<hy-push-state initial-href="https://qwtel.com/hy-push-state/example/simple/">
  <p>
    <a href="./1.html">Page 1</a>
    <a href="./2.html">Page 2</a>
    <a href="./3.html">Page 3</a>
  </p>
  <p>Super simple example.</p>
</hy-push-state>
```

When viewing this document on GitHub, npm, or elsewhere, you can check out the standalone examples:

* [WebComponent Example](https://qwtel.com/hy-push-state/example/webcomponent/){:.external}
* [jQuery Example](https://qwtel.com/hy-push-state/example/jquery/){:.external}
* [Vanilla JS Example](https://qwtel.com/hy-push-state/example/vanilla/){:.external}
* [Mixin Example](https://qwtel.com/hy-push-state/example/mixin/){:.external}


## License

|              | Personal           | Startup            | Enterprise         |
|:-------------|:------------------:|:------------------:|:------------------:|
| # Developers | 2                  | 15                 | ∞                  |
| License      | [Personal][pl]     | [Startup][sl]      | [Enterprise][el]   |
| Price        | $29                | $249               | $499               |
| | [**Buy**][bp]{:.gumroad-button} | [**Buy**][bs]{:.gumroad-button} | [**Buy**][be]{:.gumroad-button} |
{:.stretch-table}

Unless you've obtained one of the licenses above, **hy-push-state** must be used in accordance with the [GPL-3.0](LICENSE.md) license.

[pl]: licenses/personal.md
[sl]: licenses/startup.md
[el]: licenses/enterprise.md
[bp]: https://gumroad.com/l/hy-push-state-personal
[bs]: https://gumroad.com/l/hy-push-state-startup
[be]: https://gumroad.com/l/hy-push-state-enterprise


## Documentation

* [Options](doc/options.md)
* [Methods](doc/methods.md)
* [Events](doc/events.md)

### Usage
**hy-push-state** can be used in a variety of ways:
* As [Web Component](#web-component), both as *ES6 Module* and *HTML Import*
* As [jQuery](#jquery)
* As [Vanilla](#vanilla) JavaScript class
* (Advanced) Possibly as part of your own component hierarchy as [ES6 Mixin][esmixins].
* (Advanced) As part of your bundled frontend code.

[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

#### Web Component
The Web Component is the preferred way of using **hy-push-state**, but requires Web Component [support] in the browser or a [polyfill].

[support]: https://caniuse.com/#feat=template,custom-elementsv1,shadowdomv1,es6-module,imports
[polyfill]: https://github.com/webcomponents/webcomponentsjs

##### Bundled ES6 Module
This is the version that is going to have native support across all major browsers the soonest.

~~~html
<script type="module" href="https://unpkg.com/hy-push-state/dist/webcomponent/module.js"></script>

<hy-push-state link-selector="a[href]"><!-- ... --></hy-push-state>
~~~

##### HTML Import
Some browsers have decided against implementing HTML Imports, but they are easily polyfilled.

~~~html
<link rel="import" href="https://unpkg.com/hy-push-state/dist/webcomponent/hy-push-state.html">

<hy-push-state link-selector="a[href]"><!-- ... --></hy-push-state>
~~~

##### Unbundled ES6 Module (experimental)
The [unpkg CDN](https://unpkg.com/) can rewrite all bare import paths with valid unpkg URLs by passing the `?module` query parameter.
This allows importing **hy-push-state**'s source directly.
Note that this will result in possibly hundreds of separate requests.

~~~html
<script type="module" src="https://unpkg.com/hy-push-state/src/webcomponent/module?module"></script>

<hy-push-state link-selector="a[href]"><!-- ... --></hy-push-state>
~~~

#### jQuery

~~~html
<div id="pushStateEl" data-link-selector="a[href]"><!-- ... --></div>

<script src="https://unpkg.com/jquery/dist/jquery.min.js"></script>
<script src="https://unpkg.com/hy-push-state/dist/jquery"></script>
<script>
  $('#pushStateEl').pushstate()
</script>
~~~

#### Vanilla
~~~html
<div id="pushStateEl"><!-- ... --></div>

<script src="https://unpkg.com/hy-push-state/dist/vanilla"></script>
<script>
  var HyPushState = window.hyPushState.HyPushState;
  var pushState = new HyPushState(window.pushStateEl, {
    linkSelector: 'a[href]',
  });
</script>
~~~

### Size
The size of the minified bundle hovers around 90kb, or ~20kb gzipped.

| Size | File |
|-----:|:-----|
| 343K | `dist/jquery/index.dev.js` |
|  91K | `dist/jquery/index.js` |
| 332K | `dist/mixin/index.dev.js` |
|  88K | `dist/mixin/index.js` |
| 334K | `dist/vanilla/index.dev.js` |
|  88K | `dist/vanilla/index.js` |
| 344K | `dist/webcomponent/html-import.dev.js` |
|  93K | `dist/webcomponent/html-import.js` |
| 345K | `dist/webcomponent/index.dev.js` |
|  93K | `dist/webcomponent/index.js` |
| 346K | `dist/webcomponent/module.dev.js` |
|  93K | `dist/webcomponent/module.js` |


### Gold Standard
This component follows the Web Components [Gold Standard](doc/gold-standard.md){:.flip-title}.


### Source
The source code is written in a *literal programming* style, and should be reasonably approachable.
However, some knowledge of [RxJS] is required.

The core functionality is implemented in [`mixin / index.js`](doc/source/mixin/README.md),
which is used to create the framework-specific versions of the component.

* `jquery`
  * [`index.js`](doc/source/jquery/README.md)
* `mixin`
  * [`constants.js`](doc/source/mixin/constants.md)
  * [`events.js`](doc/source/mixin/events.md)
  * [`fetching.js`](doc/source/mixin/fetching.md)
  * [`history.js`](doc/source/mixin/history.md)
  * [`index.js`](doc/source/mixin/README.md)
  * [`methods.js`](doc/source/mixin/methods.md)
  * [`operators.js`](doc/source/mixin/operators.md)
  * [`script-hack.js`](doc/source/mixin/script-hack.md)
  * [`scrolling.js`](doc/source/mixin/scrolling.md)
  * [`setup.js`](doc/source/mixin/setup.md)
  * [`update.js`](doc/source/mixin/update.md)
* `vanilla`
  * [`index.js`](doc/source/vanilla/README.md)
* `webcomponent`
  * [`html-import.s`](doc/source/webcomponent/html-import.md)
  * [`index.js`](doc/source/webcomponent/README.md)
  * [`module.js`](doc/source/webcomponent/module.md)
* [`common.js`](doc/source/common.md)
* [`index.js`](doc/source/README.md)
* [`url.js`](doc/source/url.md)

[rxjs]: https://github.com/ReactiveX/rxjs
