# hy-push-state

**hy-push-state** is a 'universal' WebComponent that dynamically loads new content into the current page,
without causing a 'Flash of White'. Given sufficient similarity, it turns a collection of web pages into a web app.
It is similar to pjax and smoothState.js, but offers a better prefetching logic than smoothState and better [somethign] than pjax.

Also, it's harder to trash its internal state when quickly jumping through the browser history, or doing other malicious things.

> Turn web pages into web apps.
{:.lead}

**hy-push-state** can be used in a variety of ways:
* As **Vanilla** JavaScript class
* As **jQuery** plugin
* As **WebComponent**, both as *ES6 Module* and *HTML Import*
* Possibly as part of your own component hierarchy via [ES6 Mixin][esmixins].

The component was initially developed --- and can be encountered in the wild ---
as part of the [Hydejack](https://qwtel.com/hydejack/) Jekyll theme.

## License
**hy-push-state** is [GPL-3.0](LICENSE.md)-licensed. Commercial licenses will be available for cases where this is not acceptable.

## Examples
* [Mixin Example](example/mixin/){:.no-push-state}
* [Vanilla JS Example](example/vanilla/){:.no-push-state}
* [jQuery Example](example/jquery/){:.no-push-state}
* [WebComponent Example](example/webcomponent/){:.no-push-state}

## Usage
The most straight-forward way to use **hy-push-state** is by using the vanilla JS version and load it from a CDN:

~~~html
<script type="application/javascript" src="https://unpkg.com/hy-push-state/dist/vanilla/hy-push-state.min.js"></script>
~~~

~~~html
<main id="pushStateEl"><!--content--></aside>
<script>
  var PushState = window.hyPushState.PushState;
  var pushState = new PushState(window.pushStateEl, { /* options */ });
</script>
~~~

Usage is different for other platforms. For more see [Usage](doc/usage/README.md){:.flip-title}.

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


[esmixins]: http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
[rxjs]: https://github.com/ReactiveX/rxjs
