'use strict'

var levelup = require('levelup')

module.exports = function (leveljs, test, testCommon) {
  test('setUp', testCommon.setUp)

  test('buffer value', function (t) {
    var level = leveljs(testCommon.location())
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', Buffer.from('00ff', 'hex'), function (err) {
        t.notOk(err, 'no error')
        level.get('key', function (err, value) {
          t.notOk(err, 'no error')
          t.ok(Buffer.isBuffer(value), 'is buffer')
          t.same(value, Buffer.from('00ff', 'hex'))
          level.close(t.end.bind(t))
        })
      })
    })
  })

  // This should be covered by abstract-leveldown tests, but that's
  // prevented by process.browser checks (Level/abstract-leveldown#121).
  // This test is adapted from memdown.
  leveljs.binaryKeys && test('buffer keys', function (t) {
    var db = leveljs(testCommon.location())

    db.open(function (err) {
      t.ifError(err, 'no open error')

      var one = Buffer.from('80', 'hex')
      var two = Buffer.from('c0', 'hex')

      t.ok(two.toString() === one.toString(), 'would be equal when not buffer-aware')
      t.ok(Buffer.compare(two, one) > 0, 'but greater when buffer-aware')

      db.put(one, 'one', function (err) {
        t.notOk(err, 'no error')

        db.get(one, { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.equal(value, 'one', 'value one ok')

          db.put(two, 'two', function (err) {
            t.notOk(err, 'no error')

            db.get(one, { asBuffer: false }, function (err, value) {
              t.notOk(err, 'no error')
              t.equal(value, 'one', 'value one is the same')

              db.close(function (err) {
                t.ifError(err, 'no close error')
                t.end()
              })
            })
          })
        })
      })
    })
  })

  // Adapted from a memdown test.
  test('iterator stringifies buffer input', function (t) {
    t.plan(6)

    var db = leveljs(testCommon.location())

    db.open(function (err) {
      t.ifError(err, 'no open error')

      db.put(1, 2, function (err) {
        t.ifError(err, 'no put error')

        testCommon.collectEntries(db.iterator(), function (err, entries) {
          t.ifError(err, 'no iterator error')
          t.same(entries[0].key, Buffer.from('1'), 'key is stringified')
          t.same(entries[0].value, Buffer.from('2'), 'value is stringified')

          db.close(function (err) {
            t.ifError(err, 'no close error')
          })
        })
      })
    })
  })

  // NOTE: in chrome (at least) indexeddb gets buggy if you try and destroy a db,
  // then create it again, then try and destroy it again. these avoid doing that

  test('test levelup .destroy w/ string', function (t) {
    var location = testCommon.location()
    var db = levelup(leveljs(location))
    db.put('key', 'value', function (err) {
      t.notOk(err, 'no error')
      db.get('key', { asBuffer: false }, function (err, value) {
        t.notOk(err, 'no error')
        t.equal(value, 'value', 'should have value')
        db.close(function (err) {
          t.notOk(err, 'no error')
          leveljs.destroy(location, function (err) {
            t.notOk(err, 'no error')
            var db2 = levelup(leveljs(location))
            db2.get('key', { asBuffer: false }, function (err, value) {
              t.ok(err && err.notFound, 'key is not there')
              db2.close(t.end.bind(t))
            })
          })
        })
      })
    })
  })

  test('teardown', testCommon.tearDown)
}
