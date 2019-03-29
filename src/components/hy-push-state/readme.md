# hy-push-state



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default                         |
| ----------------- | ------------------ | ----------- | --------- | ------------------------------- |
| `duration`        | `duration`         |             | `number`  | `0`                             |
| `initialHref`     | `initial-href`     |             | `string`  | `window.location.href`          |
| `linkSelector`    | `link-selector`    |             | `string`  | `"a[href]:not([data-no-push])"` |
| `prefetch`        | `prefetch`         |             | `boolean` | `false`                         |
| `replaceSelector` | `replace-selector` |             | `string`  | `undefined`                     |
| `scriptSelector`  | `script-selector`  |             | `string`  | `undefined`                     |


## Events

| Event          | Description | Type                |
| -------------- | ----------- | ------------------- |
| `after`        |             | `CustomEvent<void>` |
| `error`        |             | `CustomEvent<void>` |
| `load`         |             | `CustomEvent<void>` |
| `networkerror` |             | `CustomEvent<void>` |
| `progress`     |             | `CustomEvent<void>` |
| `ready`        |             | `CustomEvent<void>` |
| `startThing`   |             | `CustomEvent<void>` |


## Methods

### `assign(url: string) => void`

Navigates to the given URL.

#### Parameters

| Name  | Type     | Description |
| ----- | -------- | ----------- |
| `url` | `string` |             |

#### Returns

Type: `void`



### `reload() => void`

Reloads the current page.

#### Returns

Type: `void`



### `replace(url: string) => void`

Removes the current page from the session history and navigates to the given URL.

#### Parameters

| Name  | Type     | Description |
| ----- | -------- | ----------- |
| `url` | `string` |             |

#### Returns

Type: `void`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
