/* global indexedDB */

'use strict'

var ta = require('./util/create-typed-array')
var support = require('../util/support')

// All key types supported by IndexedDB Second Edition.
var types = [
  { type: 'number', key: -20 },
  { type: '+Infinity', key: Infinity },
  { type: '-Infinity', key: -Infinity },
  { type: 'string', key: 'test' },
  { type: 'Date', ctor: true, key: new Date() },
  { type: 'Array', ctor: true, allowFailure: true, key: [0, '1'] },
  { type: 'ArrayBuffer', ctor: true, allowFailure: true, key: ta(Buffer).buffer },
  { type: 'Int8Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Uint8Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { name: 'Buffer', type: 'Uint8Array', ctor: true, allowFailure: true, key: ta(Buffer), view: true },
  { type: 'Uint8ClampedArray', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Int16Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Uint16Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Int32Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Uint32Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Float32Array', ctor: true, allowFailure: true, createKey: ta, view: true },
  { type: 'Float64Array', ctor: true, allowFailure: true, createKey: ta, view: true }
]

module.exports = function (leveljs, test, testCommon) {
  var db

  test('setUp', testCommon.setUp)
  test('open', function (t) {
    db = testCommon.factory()
    db.open(t.end.bind(t))
  })

  types.forEach(function (item) {
    var testName = item.name || item.type

    test('key type: ' + testName, function (t) {
      var Constructor = item.ctor ? global[item.type] : null
      var skip = item.allowFailure ? 'pass' : 'fail'
      var input = item.key

      if (item.ctor && !Constructor) {
        t[skip]('constructor is undefined in this environment')
        return t.end()
      }

      if (item.createKey) {
        try {
          input = item.createKey(Constructor)
        } catch (err) {
          t[skip]('constructor is not spec-compliant in this environment')
          return t.end()
        }
      }

      if (!support.test(input)(indexedDB)) {
        t[skip]('type is not supported in this environment')
        return t.end()
      }

      db.put(input, testName, function (err) {
        t.ifError(err, 'no put error')

        db.get(input, { asBuffer: false }, function (err, value) {
          t.ifError(err, 'no get error')
          t.same(value, testName, 'correct value')

          var it = db.iterator({ keyAsBuffer: false, valueAsBuffer: false })

          testCommon.collectEntries(it, function (err, entries) {
            t.ifError(err, 'no iterator error')
            t.is(entries.length, 1, '1 entry')

            var key = entries[0].key
            var value = entries[0].value

            if (Constructor) {
              var type = item.view ? 'ArrayBuffer' : item.type
              var expected = '[object ' + type + ']'
              var actual = Object.prototype.toString.call(key)

              if (actual === expected) {
                t.is(actual, expected, 'prototype')
              } else {
                t[skip]('(de)serializing is not supported by this environment')
                return t.end()
              }

              if (item.view) {
                t.ok(key instanceof ArrayBuffer, 'key is instanceof ArrayBuffer')
                t.same(Buffer.from(new Constructor(key)), ta(Buffer), 'correct octets')
              } else {
                t.ok(key instanceof Constructor, 'key is instanceof ' + type)
                t.same(key, input, 'correct key')
              }
            } else {
              t.is(key, input, 'correct key')
            }

            t.same(value, testName, 'correct value')

            db.del(input, function (err) {
              t.ifError(err, 'no del error')
              t.end()
            })
          })
        })
      })
    })
  })

  test('close', function (t) { db.close(t.end.bind(t)) })
  test('tearDown', testCommon.tearDown)
}
