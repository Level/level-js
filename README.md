![logo](logo.png)

level.js an implementation of the [leveldown](https://github.com/rvagg/node-leveldown) API on top of [IndexedDB](https://developer.mozilla.org/en-US/docs/IndexedDB) (which is in turn implemented on top of [LevelDB](https://code.google.com/p/leveldb/), which brings this whole shebang full circle)

level.js uses [IDBWrapper](https://github.com/jensarps/IDBWrapper) by jensarps to ensure compatibility between IDB implementations.

Here are the goals of this level.js:

- Store large amounts of ascii (strings, JSON) and binary (ArrayBuffers, Typed Arrays) data in modern browsers
- Be as fast as possible
- Use the leveldown test suite and sync with [multilevel](https://github.com/juliangruber/multilevel) over either ascii or binary transports (websockets and xhr both have ascii/binary modes in browsers now)

Being leveldown compatible means you can use many of the [level-* modules](https://github.com/rvagg/node-levelup/wiki/Modules) on top of this library.

For example, there is experimental support in using the popular [levelup](http://github.com/rvagg/node-levelup) library on top of level.js. See `test-levelup.js` for details

## install

```js
npm install level-js
```

(Not to be confused with [leveljs](https://github.com/rvagg/node-leveljs))

This library is best used with [browserify](http://browserify.org)

## code examples

The test suite for this library is in the [abstract-leveldown](https://github.com/rvagg/node-abstract-leveldown) repo and is shared between various leveldown implementations across different environments and platforms.

For code examples see the [abstract-leveldown test suite](https://github.com/rvagg/node-abstract-leveldown/tree/master/abstract)

The only differences between this and leveldown is that you can store `ArrayBuffers` in this (whereas leveldown just uses node `Buffer` objects)

## run the tests

```sh
git clone git@github.com:maxogden/level.js.git
cd level.js
npm install
npm test
open localhost:9966
```

Then look in your browser console

## license

BSD
