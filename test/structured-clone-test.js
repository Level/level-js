'use strict'

var ta = require('./util/create-typed-array')

function isDataCloneError (err) {
  return err.name === 'DataCloneError' || err.code === 25
}

// level-js supports all types of the structured clone algorithm
// except for null and undefined (unless nested in another type).
var types = [
  { type: 'boolean', value: true },
  { type: 'number', value: -20 },
  {
    type: 'NaN',
    value: NaN,
    test: function (value) {
      // Replacement for Number.isNaN (for IE <= 11)
      return typeof value === 'number' && isNaN(value)
    }
  },
  { type: '+Infinity', value: Infinity },
  { type: '-Infinity', value: -Infinity },
  { type: 'string', value: 'test' },
  { type: 'Boolean object', value: new Boolean(false) }, // eslint-disable-line
  { type: 'String object', value: new String('test') }, // eslint-disable-line
  { type: 'Date', ctor: true, value: new Date() },
  { type: 'RegExp', ctor: true, value: /r/g },
  { type: 'Array', ctor: true, value: [0, null, undefined] },
  { type: 'Object', ctor: true, value: { a: null, b: [undefined] } },
  {
    type: 'Object',
    name: 'Object (null prototype)',
    ctor: true,
    createValue: function () {
      return Object.create(null)
    }
  },

  { type: 'ArrayBuffer', ctor: true, allowFailure: true, value: ta(Buffer).buffer },
  { type: 'Int8Array', ctor: true, allowFailure: true, createValue: ta },

  // Don't allow failure as this is the primary type for binary (Buffer) data
  { type: 'Uint8Array', ctor: true, createValue: ta },

  { type: 'Uint8ClampedArray', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Int16Array', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Uint16Array', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Int32Array', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Uint32Array', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Float32Array', ctor: true, allowFailure: true, createValue: ta },
  { type: 'Float64Array', ctor: true, allowFailure: true, createValue: ta },
  {
    type: 'Map',
    ctor: true,
    allowFailure: true,
    createValue: function (Constructor) {
      // Replacement for Map constructor arguments (for IE 11)
      var value = new Constructor()
      value.set('test', 123)
      return value
    },
    test: function (value) {
      return value.get('test') === 123
    }
  },
  {
    type: 'Set',
    ctor: true,
    allowFailure: true,
    createValue: function (Constructor) {
      // Replacement for Set constructor arguments (for IE 11)
      var value = new Constructor()
      value.add(123)
      return value
    },
    test: function (value) {
      return value.has(123)
    }
  },
  {
    type: 'Blob',
    ctor: true,
    allowFailure: true,
    createValue: function (Constructor) {
      return new Constructor(['test'])
    },
    test: function (value) {
      // TODO. This test would be asynchronous.
      return true
    }
  },
  {
    type: 'File',
    ctor: true,
    allowFailure: true,
    createValue: function (Constructor) {
      return new Constructor(['test'], 'filename')
    },
    test: function (value) {
      // TODO. This test would be asynchronous.
      return true
    }
  },
  {
    type: 'FileList',
    ctor: true,
    allowFailure: true,
    createValue: function () {
      var input = global.document.createElement('input')
      input.type = 'file'
      return input.files
    }
  },
  {
    type: 'ImageData',
    ctor: true,
    allowFailure: true,
    createValue: function (Constructor) {
      return new Constructor(1, 1)
    },
    test: function (value) {
      return value.data.length === 4
    }
  }
]

// Types that are not supported by the structured clone algorithm
var illegalTypes = [
  { name: 'Error', value: new Error() },
  { name: 'Function', value: function () {} },
  { name: 'DOMNode', value: global.document }
]

module.exports = function (leveljs, test, testCommon) {
  var db

  test('setUp', testCommon.setUp)
  test('open', function (t) {
    db = leveljs(testCommon.location())
    db.open(t.end.bind(t))
  })

  types.forEach(function (item) {
    var testName = item.name || item.type

    test('structured clone: ' + testName, function (t) {
      var ctor = item.ctor ? global[item.type] : null
      var skip = item.allowFailure ? 'pass' : 'fail'
      var input = item.value

      if (item.ctor && !ctor) {
        t[skip]('constructor is undefined in this environment')
        return t.end()
      }

      if (item.createValue) {
        try {
          input = item.createValue(ctor)
        } catch (err) {
          t[skip]('constructor is not spec-compliant in this environment')
          return t.end()
        }
      }

      db.put(testName, input, function (err) {
        if (err && isDataCloneError(err)) {
          t[skip]('serializing is not supported by the structured clone algorithm of this environment')
          return t.end()
        }

        t.notOk(err, 'no put error')

        db.get(testName, { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no get error')

          if (ctor) {
            var expected = '[object ' + item.type + ']'
            var actual = Object.prototype.toString.call(value)

            if (actual === expected) {
              t.is(actual, expected, 'prototype')
              t.ok(value instanceof ctor, 'instanceof')
            } else {
              t[skip]('deserializing is not supported by the structured clone algorithm of this environment')
              return t.end()
            }
          }

          if (item.test) {
            t.ok(item.test(value), 'correct value')
          } else {
            t.same(value, input, 'correct value')
          }

          t.end()
        })
      })
    })
  })

  illegalTypes.forEach(function (item) {
    test('structured clone (illegal type): ' + item.name, function (t) {
      t.ok(item.value != null, 'got a value to test')

      db.put(item.name, item.value, function (err) {
        t.ok(err, 'got an error')
        t.ok(isDataCloneError(err), 'is DataCloneError')

        db.get(item.name, { asBuffer: false }, function (err, value) {
          t.ok(/notfound/i.test(err), 'nothing was stored')
          t.end()
        })
      })
    })
  })

  test('close', function (t) { db.close(t.end.bind(t)) })
  test('teardown', testCommon.tearDown)
}
