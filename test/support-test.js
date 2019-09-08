'use strict'

var support = require('../util/support')

var pos = function () { }
var neg = function () { throw new Error() }

module.exports = function (leveljs, test) {
  test('mock bufferKeys support', function (t) {
    t.ok(support.bufferKeys({ cmp: pos }))
    t.notOk(support.bufferKeys({ cmp: neg }))
    t.end()
  })
}
