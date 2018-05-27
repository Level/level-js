# level-js

> An [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) compliant store on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), which is in turn implemented on top of [LevelDB](https://github.com/google/leveldb) which brings this whole shebang full circle.

[![level badge][level-badge]](https://github.com/level/awesome)
[![npm](https://img.shields.io/npm/v/level-js.svg)](https://www.npmjs.com/package/level-js)
[![npm next](https://img.shields.io/npm/v/level-js/next.svg)](https://www.npmjs.com/package/level-js)
[![Travis](https://secure.travis-ci.org/Level/level.js.svg?branch=master)](http://travis-ci.org/Level/level.js)
[![npm](https://img.shields.io/npm/dm/level-js.svg)](https://www.npmjs.com/package/level-js)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Background

Here are the goals of `level-js`:

- Store large amounts of data in modern browsers
- Pass the full `abstract-leveldown` test suite
- Support [Buffer](https://nodejs.org/api/buffer.html) values (in all target environments)
- Support all key types of IndexedDB Second Edition, including binary keys (depends on environment)
- Support all value types of the structured clone algorithm (depends on environment)
- Be as fast as possible
- Sync with [multilevel](https://github.com/juliangruber/multilevel) over either ASCII or binary transports.

Being `abstract-leveldown` compliant means you can use many of the [Level modules](https://github.com/Level/awesome/) on top of this library. For some demos of it working, see @brycebaril's presentation [Path of the NodeBases Jedi](http://brycebaril.github.io/nodebase_jedi/#/vanilla).

## Example

**This assumes use of version `3.0.0-rc1`. The next release will have an upgrade guide. Until then, please see the [changelog](CHANGELOG.md).**

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
Returns a new `leveljs` instance. `location` is a String pointing to the IndexedDB location to be opened.

#### `options`

The optional `options` argument may contain:

* `prefix` *(string, default: `'level-js-'`)*: Prepended to the location for the underlying IndexedDB store.
* `version` *(string | number, default: `1`)*: The version to open the database with.

See [`IDBFactory#open`](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open) for more details.

## Running Tests

```sh
git clone git@github.com:Level/level.js.git
cd level.js
npm install
npm test
```

It will print out a URL to open in a browser of choice.

## Big Thanks

Cross-browser Testing Platform and Open Source ♥ Provided by [Sauce Labs](https://saucelabs.com).

[![Sauce Labs logo](./sauce-labs.svg)](https://saucelabs.com)

## License

Copyright (c) 2012-2018 `level.js` [contributors](https://github.com/level/community#contributors).

`level.js` is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included `LICENSE.md` file for more details.

[level-badge]: http://leveldb.org/img/badge.svg
