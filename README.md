![logo](logo.png)

level.js an implementation of the [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) API on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), which is in turn implemented on top of [LevelDB](https://github.com/google/leveldb), which brings this whole shebang full circle.

**Most people use [`levelup`](https://github.com/Level/levelup) on top of this library.**

For some demos of it working, see @brycebaril's presentation [Path of the NodeBases Jedi](http://brycebaril.github.io/nodebase_jedi/#/vanilla).

[![NPM](https://nodei.co/npm/level-js.png)](https://nodei.co/npm/level-js/)

Here are the goals of `level.js`:

- Store large amounts of ascii (strings, JSON) and binary (Buffer) data in modern browsers
- Be as fast as possible
- Use the leveldown test suite and sync with [multilevel](https://github.com/juliangruber/multilevel) over either ascii or binary transports (websockets and xhr both have ascii/binary modes in browsers now)

Being `abstract-leveldown` compatible means you can use many of the [Level modules](https://github.com/Level/awesome/) on top of this library.

## install

```sh
npm install level-js
```

Not to be confused with [leveljs](https://www.npmjs.com/package/leveljs).

This library is best used with [browserify](http://browserify.org).

## Browser support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/level-js.svg)](https://saucelabs.com/u/level-js)

## code examples

```js
var leveljs = require('level-js')
var db = leveljs('bigdata')
db.open(function onOpen() { })
```

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
