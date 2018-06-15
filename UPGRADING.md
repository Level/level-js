# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

## V3

This release brings `level-js` up to par with latest [`levelup`] (v2), [`abstract-leveldown`] (v5) and IndexedDB Second Edition. It targets modern `browserify`, preferring [`Buffer`] (which is the primary binary type in the Level ecosystem) over `ArrayBuffer`. Lastly, [`IDBWrapper`] has been replaced with straight IndexedDB code.

### Usage with [`levelup`]

Usage has changed to:

```js
const levelup = require('levelup')
const leveljs = require('leveljs')

const db = levelup(leveljs('mydb'))
```

From the old:

```js
const db = levelup('mydb', { db: leveljs })
```

Friendly reminder: encodings have moved from `levelup` to `encoding-down`. To get identical functionality to `levelup` < 2, please use the `level-browserify` convenience package or wrap `level-js` with `encoding-down`:

```js
const encoding = require('encoding-down')
const db = levelup(encoding(leveljs('mydb')))
```

### New database prefix

The default prefix of the [`IDBDatabase`](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase) name has changed from `IDBWrapper-` to `level-js-`. To access databases created using `level-js` < 3, pass a custom prefix to the `level-js` constructor:

```js
const db = levelup(leveljs('mydb', { prefix: 'IDBWrapper-' }))
```

### Browser support

As a result of removing [`IDBWrapper`], only modern browsers with a non-prefixed `window.indexedDB` are supported in this release. The current test matrix of `level-js` includes the latest versions of Chrome, Firefox, Safari, Edge and IE.

:fire: Internet Explorer 10 is no longer supported.

### Support all value types of the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

This means you can store almost any JS type without the need for [`encoding-down`]. Depending on the environment, this includes:

-   Number, including `NaN`, `Infinity` and `-Infinity`
-   String, Boolean, Date, RegExp, Array, Object
-   ArrayBuffer or a view thereof (typed arrays);
-   Map, Set, Blob, File, FileList, ImageData (limited support).

In addition `level-js` now stores `Buffer` values without transformation. This works in all target environments because modern `Buffer` is a subclass of `Uint8Array`, meaning such values can be passed to `IndexedDB` as-is.

If the environment does not support a type, it will throw an error which `level-js` catches and passes to the callbacks of `put` or `batch`. For example, IE does not support typed array values. At the time of writing, Chrome is the only browser that supports all types listed above.

Due to the special meaning that `null` and `undefined` have in `abstract-leveldown` iterators and Node.js streams, values of this type are converted to empty strings prior to storage.

:point_up: The structured clone algorithm can be slower than `JSON.stringify`, so don't to quick to eschew `encoding-down`.

### Support all key types of IndexedDB Second Edition

Depending on the environment, this includes:

-   Number, including `Infinity` and `-Infinity`, but not `NaN`
-   Date, except invalid (`NaN`)
-   String
-   ArrayBuffer or a view thereof (typed arrays);
-   Array, except cyclical, empty and sparse arrays. Elements must be valid types themselves.

In addition you can use `Buffer` keys, giving `level-js` the same power as implementations like `leveldown` and `memdown`. If the environment does not support a type, it will throw an error which `level-js` catches and passes to the callbacks of `get`, `put`, `del`, `batch` or an iterator. Exceptions are:

-   `null` and `undefined`: rejected early by `abstract-leveldown`
-   Boolean and `NaN`: though invalid per the IndexedDB specification, they are converted to strings for `abstract-leveldown` compatibility;
-   Binary and array keys: if not supported by the environment, `level-js` falls back to `String(key)`.

### No backpressure

In `level-js`, iterators are powered by IndexedDB cursors. To fulfill `abstract-leveldown` snapshot guarantees (reads not being affected by simultaneous writes) cursors are started immediately and continuously read from, filling an in-memory cache.

Though `level-js` now passes the full [`abstract-leveldown`] test suite, fulfulling the snapshot guarantee means a loss of backpressure. Memory consumption might increase if an iterator is not consumed fast enough. A future release will have an option to favor backpressure over snapshot guarantees.

### Remove `raw` option

Because `level-js` no longer stringifies values, the `raw` option (which bypassed conversion) became unnecessary and has been removed. If you use `level-browserify` or `levelup` with `encoding-down`, you can store and/or retrieve raw values (as returned by IndexedDB) using the `id` encoding:

```js
const db = levelup(encoding(leveljs('mydb'), { valueEncoding: 'id' }))
```

Or per operation:

```js
const db = levelup(encoding(leveljs('mydb')))
const value = await db.get('key', { valueEncoding: 'id' })
```

Note that if you stored binary data as a Buffer or typed array, with the `id` encoding you will get the data back as an `ArrayBuffer`. Conversely, with the `binary` encoding or no encoding at all, any binary data you put in will come back as a `Buffer`. This is true for both keys and values, in an environment that supports all types.

### New `destroy()` function signature

Previously, a `level-js` instance could be passed to `destroy()`:

```js
leveljs.destroy(db, callback)
```

This was useful to destroy a database that used a custom prefix. The new signature is `destroy(location[, prefix], callback)`.

### Strict `.batch(array)`

The upgrade to [`abstract-leveldown`] comes with a [breaking change](https://github.com/Level/abstract-leveldown/commit/a2621ad70571f6ade9d2be42632ece042e068805) for the array version of `.batch()`. This change ensures all elements in the batch array are objects. If you previously passed arrays to `.batch()` that contained `undefined` or `null`, they would be silently ignored. Now this will produce an error.

[`Buffer`]: https://nodejs.org/api/buffer.html
[`IDBWrapper`]: https://www.npmjs.com/package/idb-wrapper
[`abstract-leveldown`]: https://github.com/Level/abstract-leveldown
[`levelup`]: https://github.com/Level/levelup
[`encoding-down`]: https://github.com/Level/encoding-down
