/*** Levelup tests
  Temporary to test integration, can be removed later.
***/
var levelup = require('levelup')
var leveljs = require('../')
var test = require('tape')
var testCommon = require('./testCommon')

function identity (v) {
  return v
}

test('setup', testCommon.setUp)

test('levelup put', function (t) {
  t.plan(4)

  // TODO: update signature after upgrading levelup
  var db = levelup(testCommon.location(), { db: leveljs })

  db.put('name', 'LevelUP string', function (err) {
    t.ifError(err, 'no put error')

    db.get('name', function (err, value) {
      t.ifError(err, 'no get error')
      t.is(value, 'LevelUP string')

      db.close(function (err) {
        t.ifError(err, 'no close error')
      })
    })
  })
})

test('binary', function (t) {
  t.plan(6)

  // TODO: update signature after upgrading levelup
  var db = levelup(testCommon.location(), { db: leveljs, valueEncoding: 'binary' })
  var buf = Buffer.from('00ff', 'hex')

  db.put('binary', buf, function (err) {
    t.ifError(err, 'no put error')

    db.get('binary', function (err, value) {
      t.ifError(err, 'no get error')

      // This levelup is really old and its binary decoder does:
      // `return process.browser ? buffer.toString(type) : buffer`
      t.notOk(Buffer.isBuffer(value), 'not a buffer')

      db.get('binary', { valueEncoding: { decode: identity } }, function (err, value) {
        t.ifError(err, 'no get error')
        t.ok(Buffer.isBuffer(value), 'is a buffer')

        db.close(function (err) {
          t.ifError(err, 'no close error')
        })
      })
    })
  })
})

test('teardown', testCommon.tearDown)
