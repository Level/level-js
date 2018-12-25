/* global indexedDB */

'use strict'

var support = require('../util/support')

// Key types not supported by IndexedDB Second Edition.
var illegalTypes = [
  // Allow failure because IE11 treats this as a valid key.
  { name: 'NaN Date', allowFailure: true, key: new Date(''), error: 'DataError' },
  { name: 'Error', key: new Error(), error: 'DataError' },
  { name: 'Function', key: function () {}, error: 'DataError' },
  { name: 'DOMNode', key: global.document, error: 'DataError' },
  { name: 'Boolean(true)', key: new Boolean(true), error: 'DataError' }, // eslint-disable-line
  { name: 'Boolean(false)', key: new Boolean(false), error: 'DataError' }, // eslint-disable-line
]

// These are only tested if the environment supports array keys.
// Cyclical arrays are not tested because our #_serializeKey goes into a loop.
var illegalArrays = [
  // This type gets rejected by abstract-leveldown (and is also illegal in IDB).
  { name: 'empty Array', key: [], message: 'key cannot be an empty Array' },

  // These contain a valid element to ensure we don't hit an empty key assertion.
  { name: 'Array w/ null', key: ['a', null], error: 'DataError' },
  { name: 'Array w/ undefined', key: ['a', undefined], error: 'DataError' },

  { name: 'sparse Array', key: new Array(10), error: 'DataError' }
]

module.exports = function (leveljs, test, testCommon) {
  test('setUp', testCommon.setUp)

  if (support.test(['1'])(indexedDB)) {
    illegalTypes = illegalTypes.concat(illegalArrays)
  }

  illegalTypes.forEach(function (item) {
    var skip = item.allowFailure ? 'pass' : 'fail'
    var db

    test('open', function (t) {
      db = testCommon.factory()
      db.open(t.end.bind(t))
    })

    test('put() illegal key type: ' + item.name, function (t) {
      db.put(item.key, 'value', verify.bind(null, t))
    })

    test('del() illegal key type: ' + item.name, function (t) {
      db.del(item.key, verify.bind(null, t))
    })

    test('get() illegal key type: ' + item.name, function (t) {
      db.get(item.key, function (err) {
        verify(t, /NotFound/.test(err) ? null : err)
      })
    })

    test('batch() put illegal key type: ' + item.name, function (t) {
      db.batch([{ type: 'put', key: item.key, value: 'value' }], verify.bind(null, t))
    })

    test('batch() del illegal key type: ' + item.name, function (t) {
      db.batch([{ type: 'del', key: item.key }], verify.bind(null, t))
    })

    test('close', function (t) { db.close(t.end.bind(t)) })

    function verify (t, err) {
      if (!err) {
        t[skip]('type is treated as valid in this environment')
        return t.end()
      }

      if ('error' in item) t.is(err.name, item.error, 'is ' + item.error)
      if ('message' in item) t.is(err.message, item.message, item.message)

      t.end()
    }
  })

  test('tearDown', testCommon.tearDown)
}
