'use strict'

var concat = require('level-concat-iterator')

module.exports = function (leveljs, test, testCommon) {
  // Type sort order per IndexedDB Second Edition, excluding
  // types that aren't supported by all environments.
  var basicKeys = [
    // Should sort naturally
    { type: 'number', value: '-Infinity', key: -Infinity },
    { type: 'number', value: '2', key: 2 },
    { type: 'number', value: '10', key: 10 },
    { type: 'number', value: '+Infinity', key: Infinity },

    // Should sort naturally (by epoch offset)
    { type: 'date', value: 'new Date(2)', key: new Date(2) },
    { type: 'date', value: 'new Date(10)', key: new Date(10) },

    // Should sort lexicographically
    { type: 'string', value: '"10"', key: '10' },
    { type: 'string', value: '"2"', key: '2' }
  ]

  makeTest('on basic key types', basicKeys, function (verify) {
    // Should be ignored
    verify({ gt: undefined })
    verify({ gte: undefined })
    verify({ lt: undefined })
    verify({ lte: undefined })

    verify({ gt: -Infinity }, 1)
    verify({ gte: -Infinity })
    verify({ gt: +Infinity }, 4)
    verify({ gte: +Infinity }, 3)

    verify({ lt: -Infinity }, 0, 0)
    verify({ lte: -Infinity }, 0, 1)
    verify({ lt: +Infinity }, 0, 3)
    verify({ lte: +Infinity }, 0, 4)

    verify({ gt: 10 }, 3)
    verify({ gte: 10 }, 2)
    verify({ lt: 10 }, 0, 2)
    verify({ lte: 10 }, 0, 3)

    verify({ gt: new Date(10) }, 6)
    verify({ gte: new Date(10) }, 5)
    verify({ lt: new Date(10) }, 0, 5)
    verify({ lte: new Date(10) }, 0, 6)

    // IE 11 and Edge fail this test (yield 0 results), but only when the db
    // contains key types other than strings (see strings-only test below).
    // verify({ gte: '' }, 6)

    verify({ gt: '' }, 6)
    verify({ lt: '' }, 0, 6)
    verify({ lte: '' }, 0, 6)

    verify({ gt: '10' }, 7)
    verify({ gte: '10' }, 6)
    verify({ lt: '10' }, 0, 6)
    verify({ lte: '10' }, 0, 7)

    verify({ gt: '2' }, 0, 0)
    verify({ gte: '2' }, -1)
    verify({ lt: '2' }, 0, -1)
    verify({ lte: '2' })
  })

  makeTest('on string keys only', basicKeys.filter(matchType('string')), function (verify) {
    verify({ gt: '' })
    verify({ gte: '' })
    verify({ lt: '' }, 0, 0)
    verify({ lte: '' }, 0, 0)
  })

  if (leveljs.binaryKeys) {
    var binaryKeys = [
      // Should sort bitwise
      { type: 'binary', value: 'Uint8Array.from([0, 2])', key: binary([0, 2]) },
      { type: 'binary', value: 'Uint8Array.from([1, 1])', key: binary([1, 1]) }
    ]

    makeTest('on binary keys', basicKeys.concat(binaryKeys), function (verify) {
      verify({ gt: binary([]) }, -2)
      verify({ gte: binary([]) }, -2)
      verify({ lt: binary([]) }, 0, -2)
      verify({ lte: binary([]) }, 0, -2)
    })
  }

  if (leveljs.arrayKeys) {
    var arrayKeys = [
      // Should sort componentwise
      { type: 'array', value: '[100]', key: [100] },
      { type: 'array', value: '["10"]', key: ['10'] },
      { type: 'array', value: '["2"]', key: ['2'] }
    ]

    makeTest('on array keys', basicKeys.concat(arrayKeys), function (verify) {
      verify({ gt: [] }, -3)
      verify({ gte: [] }, -3)
      verify({ lt: [] }, 0, -3)
      verify({ lte: [] }, 0, -3)
    })
  }

  if (leveljs.binaryKeys && leveljs.arrayKeys) {
    makeTest('on all key types', basicKeys.concat(binaryKeys).concat(arrayKeys))
  }

  function makeTest (name, input, fn) {
    var prefix = 'native order (' + name + '): '
    var db

    test(prefix + 'open', function (t) {
      db = testCommon.factory()
      db.open(t.end.bind(t))
    })

    test(prefix + 'prepare', function (t) {
      db.batch(input.map(function (item) {
        return { type: 'put', key: item.key, value: item.value }
      }), t.end.bind(t))
    })

    function verify (options, begin, end) {
      test(prefix + humanRange(options), function (t) {
        t.plan(2)

        options.valueAsBuffer = false
        concat(db.iterator(options), function (err, result) {
          t.ifError(err, 'no concat error')
          t.same(result.map(getValue), input.slice(begin, end).map(getValue))
        })
      })
    }

    verify({})
    if (fn) fn(verify)

    test(prefix + 'close', function (t) {
      db.close(t.end.bind(t))
    })
  }
}

function matchType (type) {
  return function (item) {
    return item.type === type
  }
}

function getValue (kv) {
  return kv.value
}

// Replacement for TypedArray.from()
function binary (bytes) {
  var arr = new Uint8Array(bytes.length)
  for (var i = 0; i < bytes.length; i++) arr[i] = bytes[i]
  return arr
}

function humanRange (options) {
  var a = []

  ;['gt', 'gte', 'lt', 'lte'].forEach(function (opt) {
    if (options.hasOwnProperty(opt)) {
      var target = options[opt]

      if (typeof target === 'string' || Array.isArray(target)) {
        target = JSON.stringify(target)
      } else if (Object.prototype.toString.call(target) === '[object Date]') {
        target = 'new Date(' + target.valueOf() + ')'
      } else if (Object.prototype.toString.call(target) === '[object Uint8Array]') {
        target = 'Uint8Array.from([' + target + '])'
      }

      a.push(opt + ': ' + target)
    }
  })

  return a.length ? a.join(', ') : 'all'
}
