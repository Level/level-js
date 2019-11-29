'use strict'

var concat = require('level-concat-iterator')

module.exports = function (leveljs, test, testCommon) {
  test('setUp', testCommon.setUp)

  test('default prefix', function (t) {
    var db = testCommon.factory()

    t.ok(db.location, 'instance has location property')
    t.is(db.prefix, 'level-js-', 'instance has prefix property')

    db.open(function (err) {
      t.notOk(err, 'no open error')

      var idb = db.db
      var databaseName = idb.name
      var storeNames = idb.objectStoreNames

      t.is(databaseName, 'level-js-' + db.location, 'database name is prefixed')
      t.is(storeNames.length, 1, 'created 1 object store')
      t.is(storeNames.item(0), db.location, 'object store name equals location')

      db.close(t.end.bind(t))
    })
  })

  test('custom prefix', function (t) {
    var db = testCommon.factory({ prefix: 'custom-' })

    t.ok(db.location, 'instance has location property')
    t.is(db.prefix, 'custom-', 'instance has prefix property')

    db.open(function (err) {
      t.notOk(err, 'no open error')

      var idb = db.db
      var databaseName = idb.name
      var storeNames = idb.objectStoreNames

      t.is(databaseName, 'custom-' + db.location, 'database name is prefixed')
      t.is(storeNames.length, 1, 'created 1 object store')
      t.is(storeNames.item(0), db.location, 'object store name equals location')

      db.close(t.end.bind(t))
    })
  })

  test('empty prefix', function (t) {
    var db = testCommon.factory({ prefix: '' })

    t.ok(db.location, 'instance has location property')
    t.is(db.prefix, '', 'instance has prefix property')

    db.open(function (err) {
      t.notOk(err, 'no open error')

      var idb = db.db
      var databaseName = idb.name
      var storeNames = idb.objectStoreNames

      t.is(databaseName, db.location, 'database name is prefixed')
      t.is(storeNames.length, 1, 'created 1 object store')
      t.is(storeNames.item(0), db.location, 'object store name equals location')

      db.close(t.end.bind(t))
    })
  })

  test('put Buffer value, get Buffer value', function (t) {
    var level = testCommon.factory()
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

  test('put Buffer value, get Uint8Array value', function (t) {
    var level = testCommon.factory()
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', Buffer.from('00ff', 'hex'), function (err) {
        t.notOk(err, 'no error')
        level.get('key', { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.notOk(Buffer.isBuffer(value), 'is not a buffer')
          t.ok(value instanceof Uint8Array, 'is a Uint8Array')
          t.same(Buffer.from(value), Buffer.from('00ff', 'hex'))
          level.close(t.end.bind(t))
        })
      })
    })
  })

  test('put Uint8Array value, get Buffer value', function (t) {
    var level = testCommon.factory()
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', new Uint8Array(Buffer.from('00ff', 'hex').buffer), function (err) {
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

  test('put Uint8Array value, get Uint8Array value', function (t) {
    var level = testCommon.factory()
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', new Uint8Array(Buffer.from('00ff', 'hex').buffer), function (err) {
        t.notOk(err, 'no error')
        level.get('key', { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.notOk(Buffer.isBuffer(value), 'is not a buffer')
          t.ok(value instanceof Uint8Array, 'is a Uint8Array')
          t.same(Buffer.from(value), Buffer.from('00ff', 'hex'))
          level.close(t.end.bind(t))
        })
      })
    })
  })

  test('put ArrayBuffer value, get Buffer value', function (t) {
    var level = testCommon.factory()
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', Buffer.from('00ff', 'hex').buffer, function (err) {
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

  test('put ArrayBuffer value, get ArrayBuffer value', function (t) {
    var level = testCommon.factory()
    level.open(function (err) {
      t.notOk(err, 'no error')
      level.put('key', Buffer.from('00ff', 'hex').buffer, function (err) {
        t.notOk(err, 'no error')
        level.get('key', { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.ok(value instanceof ArrayBuffer, 'is a ArrayBuffer')
          t.same(Buffer.from(value), Buffer.from('00ff', 'hex'))
          level.close(t.end.bind(t))
        })
      })
    })
  })

  // This should be covered by abstract-leveldown tests, but that's
  // prevented by process.browser checks (Level/abstract-leveldown#121).
  // This test is adapted from memdown.
  leveljs.binaryKeys && test('buffer keys', function (t) {
    var db = testCommon.factory()

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

  // This should be covered by abstract-leveldown tests, but that's
  // prevented by process.browser checks (Level/abstract-leveldown#121).
  leveljs.binaryKeys && test('iterator yields buffer keys', function (t) {
    var db = testCommon.factory()

    db.open(function (err) {
      t.ifError(err, 'no open error')

      db.batch([
        { type: 'put', key: Buffer.from([0]), value: 0 },
        { type: 'put', key: Buffer.from([1]), value: 1 }
      ], function (err) {
        t.ifError(err, 'no batch error')

        var it = db.iterator({ valueAsBuffer: false })
        concat(it, function (err, entries) {
          t.ifError(err, 'no iterator error')

          t.same(entries, [
            { key: Buffer.from([0]), value: 0 },
            { key: Buffer.from([1]), value: 1 }
          ], 'keys are Buffers')

          db.close(function (err) {
            t.ifError(err, 'no close error')
            t.end()
          })
        })
      })
    })
  })

  // Adapted from a memdown test.
  test('iterator stringifies buffer input', function (t) {
    t.plan(6)

    var db = testCommon.factory()

    db.open(function (err) {
      t.ifError(err, 'no open error')

      db.put(1, 2, function (err) {
        t.ifError(err, 'no put error')

        concat(db.iterator(), function (err, entries) {
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

  test('test .destroy', function (t) {
    var db = testCommon.factory()
    var location = db.location
    db.open(function (err) {
      t.notOk(err, 'no error')
      db.put('key', 'value', function (err) {
        t.notOk(err, 'no error')
        db.get('key', { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.equal(value, 'value', 'should have value')
          db.close(function (err) {
            t.notOk(err, 'no error')
            leveljs.destroy(location, function (err) {
              t.notOk(err, 'no error')
              var db2 = leveljs(location)
              db2.open(function (err) {
                t.notOk(err, 'no error')
                db2.get('key', { asBuffer: false }, function (err, value) {
                  t.is(err.message, 'NotFound', 'key is not there')
                  db2.close(t.end.bind(t))
                })
              })
            })
          })
        })
      })
    })
  })

  test('test .destroy and custom prefix', function (t) {
    var prefix = 'custom-'
    var db = testCommon.factory({ prefix: prefix })
    var location = db.location

    db.open(function (err) {
      t.notOk(err, 'no error')
      db.put('key', 'value', function (err) {
        t.notOk(err, 'no error')
        db.get('key', { asBuffer: false }, function (err, value) {
          t.notOk(err, 'no error')
          t.equal(value, 'value', 'should have value')
          db.close(function (err) {
            t.notOk(err, 'no error')
            leveljs.destroy(location, prefix, function (err) {
              t.notOk(err, 'no error')
              var db2 = leveljs(location, { prefix: prefix })
              db2.open(function (err) {
                t.notOk(err, 'no error')
                db2.get('key', { asBuffer: false }, function (err, value) {
                  t.is(err.message, 'NotFound', 'key is not there')
                  db2.close(t.end.bind(t))
                })
              })
            })
          })
        })
      })
    })
  })

  test('teardown', testCommon.tearDown)
}
