# level-js

> An [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) compliant store on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), which is in turn implemented on top of [LevelDB](https://github.com/google/leveldb) which brings this whole shebang full circle.

[![level badge][level-badge]](https://github.com/level/awesome)
[![npm](https://img.shields.io/npm/v/level-js.svg)](https://www.npmjs.com/package/level-js)
[![npm next](https://img.shields.io/npm/v/level-js/next.svg)](https://www.npmjs.com/package/level-js)
[![Travis](https://secure.travis-ci.org/Level/level-js.svg?branch=master)](http://travis-ci.org/Level/level-js)
[![npm](https://img.shields.io/npm/dm/level-js.svg)](https://www.npmjs.com/package/level-js)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Background

Here are the goals of `level-js`:

-   Store large amounts of data in modern browsers
-   Pass the full `abstract-leveldown` test suite
-   Support [Buffer](https://nodejs.org/api/buffer.html) values (in all target environments)
-   Support all key types of IndexedDB Second Edition, including binary keys (depends on environment)
-   Support all value types of the structured clone algorithm (depends on environment) except for `null` and `undefined`
-   Be as fast as possible
-   Sync with [multilevel](https://github.com/juliangruber/multilevel) over either ASCII or binary transports.

Being `abstract-leveldown` compliant means you can use many of the [Level modules](https://github.com/Level/awesome/) on top of this library. For some demos of it working, see @brycebaril's presentation [Path of the NodeBases Jedi](http://brycebaril.github.io/nodebase_jedi/#/vanilla).

## Example

**If you are upgrading:** please see [UPGRADING.md](UPGRADING.md).

```js
var levelup = require('levelup')
var leveljs = require('level-js')
var db = levelup(leveljs('bigdata'))

db.put('hello', Buffer.from('world'), function (err) {
  if (err) throw err

  db.get('hello', function (err, value) {
    if (err) throw err

    console.log(value.toString()) // 'world'
  })
})
```

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/level-js.svg)](https://saucelabs.com/u/level-js)

## Install

```bash
npm install level-js       # Stable
npm install level-js@next  # Bleeding edge
```

Not to be confused with [leveljs](https://www.npmjs.com/package/leveljs).

This library is best used with [browserify](http://browserify.org).

## API

### `db = leveljs(location[, options])`

Returns a new `leveljs` instance. `location` is the string name of the [`IDBDatabase`](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase) to be opened, as well as the object store within that database. The database name will be prefixed with `options.prefix`.

#### `options`

The optional `options` argument may contain:

-   `prefix` _(string, default: `'level-js-'`)_: Prefix for `IDBDatabase` name.
-   `version` _(string | number, default: `1`)_: The version to open the database with.

See [`IDBFactory#open`](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open) for more details.

## Running Tests

```sh
git clone git@github.com:Level/level-js.git
cd level-js
npm install
npm test
```

It will print out a URL to open in a browser of choice.

## Big Thanks

Cross-browser Testing Platform and Open Source ♥ Provided by [Sauce Labs](https://saucelabs.com).

[![Sauce Labs logo](./sauce-labs.svg)](https://saucelabs.com)

## License

[MIT](./LICENSE.md) © 2012-present [Max Ogden](https://github.com/maxogden) and [Contributors](./CONTRIBUTORS.md).

[level-badge]: http://leveldb.org/img/badge.svg
