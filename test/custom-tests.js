var levelup = require('levelup')

module.exports.all = function(leveljs, tape, testCommon) {
  tape('setUp', testCommon.setUp)

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
          level.close(t.end.bind(t))
        })
      })
    })
  })

  // TODO: merge this and the test below. Test all types.
  tape('store native JS types', function(t) {
    var level = leveljs(testCommon.location())
    level.open(function(err) {
      t.notOk(err, 'no error')
      level.put('key', true, function (err) {
        t.notOk(err, 'no error')
        level.get('key', { asBuffer: false }, function(err, value) {
          t.notOk(err, 'no error')
          t.ok(typeof value === 'boolean', 'is boolean type')
          t.ok(value, 'is truthy')
          level.close(t.end.bind(t))
        })
      })
    })
  })

  // TODO: this should be supported without raw: true. Which is possible once
  // we upgrade abstract-leveldown (which only tests strings and Buffers now).
  tape('store NaN value', function(t) {
    var level = leveljs(testCommon.location())
    level.open(function(err) {
      t.notOk(err, 'no error')
      level.put('key', NaN, function (err) {
        t.notOk(err, 'no error')
        level.get('key', { asBuffer: false }, function(err, value) {
          t.notOk(err, 'no error')
          t.ok(Number.isNaN(value), 'is NaN')
          level.close(t.end.bind(t))
        })
      })
    })
  })

  // NOTE: in chrome (at least) indexeddb gets buggy if you try and destroy a db,
  // then create it again, then try and destroy it again. these avoid doing that

  tape('test levelup .destroy w/ string', function(t) {
    var location = testCommon.location()
    var level = levelup(location, {db: leveljs})
    level.put('key', 'value', function (err) {
      t.notOk(err, 'no error')
      level.get('key', function (err, value) {
        t.notOk(err, 'no error')
        t.equal(value, 'value', 'should have value')
        level.close(function (err) {
          t.notOk(err, 'no error')
          leveljs.destroy(location, function (err) {
            t.notOk(err, 'no error')
            var level2 = levelup(location, {db: leveljs})
            level2.get('key', function (err, value) {
              t.ok(err, 'key is not there')
              level2.close(t.end.bind(t))
            })
          })
        })
      })
    })
  })

  tape('test levelup .destroy w/ db instance', function(t) {
    var location = testCommon.location()
    var level = levelup(location, {db: leveljs})
    level.put('key', 'value', function (err) {
      t.notOk(err, 'no error')
      level.get('key', function (err, value) {
        t.notOk(err, 'no error')
        t.equal(value, 'value', 'should have value')
        level.close(function (err) {
          t.notOk(err, 'no error')
          leveljs.destroy(level.db, function (err) {
            t.notOk(err, 'no error')
            var level2 = levelup(location, {db: leveljs})
            level2.get('key', function (err, value) {
              t.ok(err, 'key is not there')
              level2.close(t.end.bind(t))
            })
          })
        })
      })
    })
  })

  tape('teardown', testCommon.tearDown)
}
