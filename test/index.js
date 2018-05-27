'use strict'

// Promise polyfill for IE and others.
if (process.browser && typeof Promise !== 'function') {
  global.Promise = require('pinkie')
}

// Load IndexedDBShim
// require('./util/idb-shim.js')()

var test = require('tape')
var leveljs = require('..')
var testCommon = require('./util/test-common')

// Test feature detection
require('./support-test')(leveljs, test)

// Test abstract-leveldown compliance
require('abstract-leveldown/abstract/leveldown-test').args(leveljs, test, testCommon)
require('abstract-leveldown/abstract/open-test').open(leveljs, test, testCommon)
require('abstract-leveldown/abstract/put-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/del-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/get-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/batch-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/chained-batch-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/close-test').close(leveljs, test, testCommon)
require('abstract-leveldown/abstract/iterator-test').all(leveljs, test, testCommon)
require('abstract-leveldown/abstract/iterator-range-test').all(leveljs, test, testCommon)

// Additional tests for this implementation
require('./custom-test')(leveljs, test, testCommon)
require('./structured-clone-test')(leveljs, test, testCommon)
require('./key-type-test')(leveljs, test, testCommon)
