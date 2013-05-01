# level.js

![logo](logo.png)

This is a client side JS implementation of the [leveldown](https://github.com/rvagg/node-leveldown) API on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/IndexedDB) (which is in turn implemented on top of [LevelDB](https://code.google.com/p/leveldb/), which brings this whole shebang full circle)

Here are the goals of this library:

- Store large amounts of ascii and binary data in modern browsers
- Be as fast as possible
- Don't abstract away features of IndexedDB
- Use the leveldown test suite and sync with [multilevel](https://github.com/juliangruber/multilevel) over either ascii or binary transports (websockets and xhr both have ascii/binary modes in browsers now)

## install

```js
npm install level-js
```

(Not to be confused with [leveljs](https://github.com/rvagg/node-leveljs))

This library is best used with [browserify](http://browserify.org)

## code examples

The test suite for this library is in the [abstract-leveldown](https://github.com/rvagg/node-abstract-leveldown) repo and is shared between various leveldown implementations across different environments and platforms.

For code examples see the [abstract-leveldown test suite](https://github.com/rvagg/node-abstract-leveldown/tree/master/abstract)

## run the tests

```sh
git clone git@github.com:maxogden/level.js.git
cd level.js
npm install
npm start
open localhost:9966
```

Then look in your browser console

## license

BSD
