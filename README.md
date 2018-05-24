![logo](logo.png)

level.js an implementation of the [leveldown](https://github.com/rvagg/node-leveldown) API on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/IndexedDB) (which is in turn implemented on top of [LevelDB](https://code.google.com/p/leveldb/), which brings this whole shebang full circle)

**Most people use [levelup](http://github.com/rvagg/node-levelup) on top of this library. See `test-levelup.js` for details**

For some demos of it working, see @brycebaril's presentation "Path of the NodeBases Jedi": http://brycebaril.github.io/nodebase_jedi/#/vanilla

[![NPM](https://nodei.co/npm/level-js.png)](https://nodei.co/npm/level-js/)

level.js uses [IDBWrapper](https://github.com/jensarps/IDBWrapper) by jensarps to ensure compatibility between IDB implementations.

Here are the goals of this level.js:

- Store large amounts of ascii (strings, JSON) and binary (Buffer) data in modern browsers
- Be as fast as possible
- Use the leveldown test suite and sync with [multilevel](https://github.com/juliangruber/multilevel) over either ascii or binary transports (websockets and xhr both have ascii/binary modes in browsers now)

Being leveldown compatible means you can use many of the [level-* modules](https://github.com/rvagg/node-levelup/wiki/Modules) on top of this library.

## install

```sh
npm install level-js
```

(Not to be confused with [leveljs](https://github.com/rvagg/node-leveljs))

This library is best used with [browserify](http://browserify.org)

## Browser support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/level-js.svg)](https://saucelabs.com/u/level-js)

## code examples

```js
var leveljs = require('level-js')
var db = leveljs('bigdata')
db.open(function onOpen() { })
```

The test suite for this library is in the [abstract-leveldown](https://github.com/rvagg/node-abstract-leveldown) repo and is shared between various leveldown implementations across different environments and platforms.

For more code examples see the [abstract-leveldown test suite](https://github.com/rvagg/node-abstract-leveldown/tree/master/abstract)

## run the tests

```sh
git clone git@github.com:maxogden/level.js.git
cd level.js
npm install
npm test
open localhost:9966
```

Then look in your browser console

## Big Thanks

Cross-browser Testing Platform and Open Source ♥ Provided by [Sauce Labs](https://saucelabs.com).

[![Sauce Labs logo](./sauce-labs.svg)](https://saucelabs.com)

## License

Copyright (c) 2012-2018 `level.js` [contributors](https://github.com/level/community#contributors).

`level.js` is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included `LICENSE.md` file for more details.
