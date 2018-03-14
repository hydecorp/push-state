# hy-push-state

[![npm version](https://badge.fury.io/js/hy-push-state.svg)](https://badge.fury.io/js/hy-push-state)

**hy-push-state** is a web component that lets you turn web pages into web apps.
The component dynamically loads new content (formerly known as "ajax") and inserts it into the current page,
without causing Flash of White, Flash of Unstyled Content, etc.

> Turn web pages into web apps.
{:.lead}

**hy-push-state** is similar to [pjax] and [smoothState], but offers a more advanced pre-fetching logic and
gives more control over timings to enable custom page transition animations.

**hy-push-state** can be used in a variety of ways:
* As **Vanilla** JavaScript class
* As **jQuery** plugin
* As **WebComponent**, both as *ES6 Module* and *HTML Import*
* Possibly as part of your own component hierarchy via [ES6 Mixin][esmixins].

**hy-drawer** is used by hundreds of sites as part of the [Hydejack]{:.external} Jekyll theme.

**NOTE**: The current version is a pre-release. The public API may still change in important ways.
{:.message}

[pjax]: https://github.com/defunkt/jquery-pjax
[smoothstate]: https://github.com/miguel-perez/smoothState.js
[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
[rxjs]: https://github.com/ReactiveX/rxjs
[hydejack]: https://qwtel.com/hydejack/

<!--more-->

## Example

* [Mixin Example](https://qwtel.com/hy-push-state/example/mixin/){:.external}
* [Vanilla JS Example](https://qwtel.com/hy-push-state/example/vanilla/){:.external}
* [jQuery Example](https://qwtel.com/hy-push-state/example/jquery/){:.external}
* [WebComponent Example](https://qwtel.com/hy-push-state/example/webcomponent/){:.external}


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

* [Options](doc/options.md){:.flip-title}
* [Methods](doc/methods.md){:.flip-title}
* [Events](doc/events.md){:.flip-title}

### Usage
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
