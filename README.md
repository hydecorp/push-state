# hy-push-state

[![npm version](https://badge.fury.io/js/hy-push-state.svg)](https://badge.fury.io/js/hy-push-state){:.no-mark-external}

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

The component was initially developed --- and can be encountered in the wild ---
as part of the [Hydejack](https://qwtel.com/hydejack/) Jekyll theme.

**NOTE**: The current version is a custom build for Hydejack, which works fine but assumes that you don't do certain "evil" things,
like detaching and re-attaching it to the DOM, etc. This will be fixed in the 1.0.0 release.
{:.message}

## License
**hy-push-state** is [GPL-3.0](LICENSE.md)--licensed.
Commercial licenses will be available for cases where this is not suitable.

## Examples
* [Mixin Example](example/mixin/index.html){:.external}
* [Vanilla JS Example](example/vanilla/index.html){:.external}
* [jQuery Example](example/jquery/index.html){:.external}
* [WebComponent Example](example/webcomponent/index.html){:.external}

## Usage
The most straight-forward way to use **hy-push-state** is by using the vanilla JS version and load it from a CDN:

~~~html
<script src="https://unpkg.com/hy-push-state/dist/vanilla/hy-push-state.min.js"></script>
~~~

~~~html
<main id="pushStateEl"><!--content--></main>
<script>
  var PushState = window.hyPushState.PushState;
  var pushState = new PushState(window.pushStateEl, { /* options */ });
</script>
~~~

This assumes all pages have an element with `id="pushStateEl"`, which will be used for replacement.
You can get more fine-grained control over which elements get replaced with the [`replaceIds` option](doc/options.md#replaceids).

## Documentation

* [Options](doc/options.md)
* [Methods](doc/methods.md)
* [Events](doc/events.md)

## Source
The source code is written in a *literal programming* style, and should be reasonably approachable.
However, some knowledge of [RxJS] is required.

The core functionality is implemented in [`mixin / index.js`](doc/source/mixin/index.md),
which is used to create the framework-specific versions of the component.

* `jquery`
  * [`index.js`](doc/source/jquery/index.md)
* `mixin`
  * [`index.js`](doc/source/mixin/index.md)
* `vanilla`
  * [`index.js`](doc/source/vanilla/index.md)
* `webcomponent`
  * [`index.js`](doc/source/webcomponent/index.md)
  * [`html-import.js`](doc/source/webcomponent/html-import.md)
* [`common.js`](doc/source/common.md)
* [`url.js`](doc/source/url.md)

[pjax]: https://github.com/defunkt/jquery-pjax
[smoothstate]: https://github.com/miguel-perez/smoothState.js
[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
[rxjs]: https://github.com/ReactiveX/rxjs
