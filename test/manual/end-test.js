'use strict'

var test = require('tape')
var leveljs = require('../..')
var testCommon = require('../testCommon')
var db

test('setUp', testCommon.setUp)

test('create', function (t) {
  db = leveljs(testCommon.location())
  db.open(function (err) {
    t.ifError(err)

    db.put('key', 'value', function (err) {
      t.ifError(err)
      t.end()
    })
  })
})

test('repeated end', function (t) {
  function loop (n) {
    if (n > 5e3) return t.end()

    var iterator = db.iterator()

    iterator.next(function (err, key, value) {
      if (err) throw err

      t.is(key.toString(), 'key', 'correct key')
      t.is(value.toString(), 'value', 'correct value')

      iterator.end(function (err) {
        if (err) throw err
        loop(n + 1)
      })
    })
  }

  loop(0)
})

test('close', function (t) {
  db.close(function (err) {
    t.ifError(err)
    t.end()
  })
})

test('tearDown', testCommon.tearDown)
