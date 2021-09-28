'use strict'

const test = require('tape')
const uuid = require('uuid/v4')
const suite = require('abstract-leveldown/test')
const leveljs = require('..')

// Test feature detection
require('./support-test')(leveljs, test)

const testCommon = suite.common({
  test: test,
  factory: function (opts) {
    return leveljs(uuid(), opts)
  },

  // Unsupported features
  createIfMissing: false,
  errorIfExists: false,
  seek: false,

  // Support of buffer keys depends on environment
  bufferKeys: leveljs(uuid()).supports.bufferKeys,

  // Opt-in to new tests
  clear: true,
  getMany: true
})

// Test abstract-leveldown compliance
suite(testCommon)

// Additional tests for this implementation
require('./custom-test')(leveljs, test, testCommon)
require('./upgrade-test')(leveljs, test, testCommon)
