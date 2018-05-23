var levelup = require('levelup')

module.exports.setUp = function (leveldown, test, testCommon) {
  test('setUp common', testCommon.setUp)
  test('setUp db', function (t) {
    db = leveldown(testCommon.location())
    db.open(t.end.bind(t))
  })
}

module.exports.all = function(leveljs, tape, testCommon) {

  module.exports.setUp(leveljs, tape, testCommon)

  // This is covered by abstract-leveldown tests, but we're
  // not on latest yet, so this is insurance.
  tape('store buffer value', function(t) {
    var level = leveljs(testCommon.location())
    level.open(function(err) {
      t.notOk(err, 'no error')
      level.put('key', Buffer.from('00ff', 'hex'), function (err) {
        t.notOk(err, 'no error')
        level.get('key', function(err, value) {
          t.notOk(err, 'no error')
          t.ok(Buffer.isBuffer(value), 'is buffer')
          t.same(value, Buffer.from('00ff', 'hex'))
          t.end()
        })
      })
    })
  })

  tape('store native JS types with raw = true', function(t) {
    var level = leveljs(testCommon.location())
    level.open(function(err) {
      t.notOk(err, 'no error')
      level.put('key', true, { raw: true },  function (err) {
        t.notOk(err, 'no error')
        level.get('key', { raw: true }, function(err, value) {
          t.notOk(err, 'no error')
          t.ok(typeof value === 'boolean', 'is boolean type')
          t.ok(value, 'is truthy')
          t.end()
        })
      })
    })
  })

  // NOTE: in chrome (at least) indexeddb gets buggy if you try and destroy a db,
  // then create it again, then try and destroy it again. these avoid doing that

  tape('test levelup .destroy w/ string', function(t) {
    var level = levelup('destroy-test', {db: leveljs})
    level.put('key', 'value', function (err) {
      t.notOk(err, 'no error')
      level.get('key', function (err, value) {
        t.notOk(err, 'no error')
        t.equal(value, 'value', 'should have value')
        level.close(function (err) {
          t.notOk(err, 'no error')
          leveljs.destroy('destroy-test', function (err) {
            t.notOk(err, 'no error')
            var level2 = levelup('destroy-test', {db: leveljs})
            level2.get('key', function (err, value) {
              t.ok(err, 'key is not there')
              t.end()
            })
          })
        })
      })
    })
  })

  tape('test levelup .destroy w/ db instance', function(t) {
    var level = levelup('destroy-test-2', {db: leveljs})
    level.put('key', 'value', function (err) {
      t.notOk(err, 'no error')
      level.get('key', function (err, value) {
        t.notOk(err, 'no error')
        t.equal(value, 'value', 'should have value')
        level.close(function (err) {
          t.notOk(err, 'no error')
          leveljs.destroy(level.db, function (err) {
            t.notOk(err, 'no error')
            var level2 = levelup('destroy-test-2', {db: leveljs})
            level2.get('key', function (err, value) {
              t.ok(err, 'key is not there')
              t.end()
            })
          })
        })
      })
    })
  })

}
