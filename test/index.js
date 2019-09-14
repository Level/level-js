'use strict'

var test = require('tape')
var uuid = require('uuid/v4')
var suite = require('abstract-leveldown/test')
var leveljs = require('..')

// Test feature detection
require('./support-test')(leveljs, test)

var testCommon = suite.common({
  test: test,
  factory: function (opts) {
    return leveljs(uuid(), opts)
  },

  // Unsupported features
  createIfMissing: false,
  errorIfExists: false,
  seek: false,

  // Support of buffer keys depends on environment
  bufferKeys: leveljs(uuid()).supports.bufferKeys
})

// Test abstract-leveldown compliance
suite(testCommon)

// Additional tests for this implementation
require('./custom-test')(leveljs, test, testCommon)
require('./upgrade-test')(leveljs, test, testCommon)
