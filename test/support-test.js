/* global indexedDB */

'use strict'

var support = require('../util/support')

var pos = function () { }
var neg = function () { throw new Error() }

module.exports = function (leveljs, test) {
  test('mock binaryKeys support', function (t) {
    t.ok(support.binaryKeys({ cmp: pos }))
    t.notOk(support.binaryKeys({ cmp: neg }))
    t.end()
  })

  test('mock arrayKeys support', function (t) {
    t.ok(support.arrayKeys({ cmp: pos }))
    t.notOk(support.arrayKeys({ cmp: neg }))
    t.end()
  })

  // Purely informational
  test('support', function (t) {
    t.pass('binary keys: ' + support.binaryKeys(indexedDB))
    t.pass('array keys: ' + support.arrayKeys(indexedDB))
    t.end()
  })
}
