# Events
Events are dispatched from the root element of the component and are prefixed with the name of the component.
Note that --- to be an idiomatic WebComponent --- all communication form the component back to the outside world occurs via events.

* toc
{:toc}

## `hy-push-state-init`
This event is fired whenever the component gets attached to the DOM.

jQuery event name
: `init.hy.pushstate`

***

## `hy-push-state-load`
This event is fired after every dynamic page load, including the initial page load.

jQuery event name
: `load.hy.pushstate`

***

## `hy-push-state-start`
This event is fired at the beginning of every page transition, after the user clicks a link,
or presses the back button, etc...

You can use this to start custom page transition animations.
The event's `detail` field exposes a `transitionUntil` function
that you can use to delay replacing the current content until the animation completes, e.g.:

```js
hyPushStateEl.addEventListener('hy-push-state-start', ({ detail }) => {
  const animPromise = new Promise((resolve) => {
    const anim = myContent.animate(...);
    anim.addEventListener('finish', resolve);
  });
  detail.transitionUntil(animPromise);
});
```

PRO Tip: `transitionUntil` will also accept an [`Observable`](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html),
delaying replacing the content until the observable completes.
{:.message}

jQuery event name
: `start.hy.pushstate`

***

## `hy-push-state-ready`
This event is fired when hy-push-state is ready to replace the current content with the new content, i.e.
it has received a response from the server and successfully parsed the content.

You can use this to modify the content before it gets inserted into the DOM.
The event's `detail` field exposes the new content via the `replaceEls` array,
which contains an `Element` for every id in [`replaceIds`](options.md#replaceids).

```js
hyPushStateEl.addEventListener('hy-push-state-ready', ({ detail }) => {
  detail.replaceEls.forEach(fragment =>
    Array.prototype.forEach.call(fragment.querySelectorAll('a[href]'), link => ...);
  );
});
```

jQuery event name
: `ready.hy.pushstate`

***

## `hy-push-state-after`
This event is fired immediately after hy-push-state has replaced the current content with the new content.

jQuery event name
: `after.hy.pushstate`

***

## `hy-push-state-progress`
This event is fired when fetching the new page takes longer than expected.
You can use this to show a loading spinner.

Specifically, if `transitionUntil` has been called during `hy-push-state-start`,
the event will fire when the provided promise resolves, but no response from the server is available yet.
If `transitionUntil` hasn't been called, the event will fire after [`duration`](options.md#duration) ms.

jQuery event name
: `progress.hy.pushstate`

***

## `hy-push-state-networkerror`
This event is fired when a network error occurs while fetching a new page form the server.
You can use this to show a custom error page,
possibly with a button to call the component's [`reload`](methods.md#reload) method.

jQuery event name
: `networkerror.hy.pushstate`

***

## `hy-push-state-error`
Event for generic errors. This event is fired when when there is an error while inserting new content into the DOM.

jQuery event name
: `error.hy.pushstate`
