/*** Levelup tests
  NOTE: Temporary integration tests, can be removed later. Remember
  to also remove the encoding-down devDependency.
***/
var levelup = require('levelup')
var encoding = require('encoding-down')
var leveljs = require('../')
var test = require('tape')
var testCommon = require('./util/test-common')

test('setup', testCommon.setUp)

test('levelup put', function (t) {
  t.plan(4)

  var down = leveljs(testCommon.location())
  var db = levelup(down)

  db.put('name', 'LevelUP string', function (err) {
    t.ifError(err, 'no put error')

    db.get('name', { asBuffer: false }, function (err, value) {
      t.ifError(err, 'no get error')
      t.is(value, 'LevelUP string')

      db.close(function (err) {
        t.ifError(err, 'no close error')
      })
    })
  })
})

test('binary', function (t) {
  t.plan(9)

  var down = leveljs(testCommon.location())
  var db = levelup(encoding(down, { valueEncoding: 'binary' }))
  var buf = Buffer.from('00ff', 'hex')

  db.put('binary', buf, function (err) {
    t.ifError(err, 'no put error')

    db.get('binary', function (err, value) {
      t.ifError(err, 'no get error')
      t.ok(Buffer.isBuffer(value), 'is a buffer')
      t.same(value, buf)

      db.get('binary', { valueEncoding: 'id' }, function (err, value) {
        t.ifError(err, 'no get error')
        t.notOk(Buffer.isBuffer(value), 'is not a buffer')
        t.ok(value instanceof Uint8Array, 'is a Uint8Array')
        t.same(Buffer.from(value), buf)

        db.close(function (err) {
          t.ifError(err, 'no close error')
        })
      })
    })
  })
})

test('teardown', testCommon.tearDown)
