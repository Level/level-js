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
  
  tape('should use a callback only once per next-handler', function(t) {
    var level = leveljs(testCommon.location())
    level.open(function(err) {
      t.notOk(err, 'no error')
      level.put('akey', 'aval',  function (err) {
        t.notOk(err, 'no error')
        level.put('bkey', 'bval',  function (err) {
          t.notOk(err, 'no error')
          level.put('ckey', 'cval',  function (err) {
            t.notOk(err, 'no error')

            var iterator = level.iterator({ keyAsBuffer: false, valueAsBuffer: false })

            iterator.next(function(err, key, value) {
              t.notOk(err, 'no error')
              t.equal(key, 'akey', 'should have akey')
              t.equal(value, 'aval', 'should have avalue')

              setTimeout(function() {
                iterator.next(function(err, key, value) {
                  t.notOk(err, 'no error')
                  t.equal(key, 'bkey', 'should have bkey')
                  t.equal(value, 'bval', 'should have bvalue')

                  setTimeout(function() {
                    iterator.next(function(err, key, value) {
                      t.notOk(err, 'no error')
                      t.equal(key, 'ckey', 'should have ckey')
                      t.equal(value, 'cval', 'should have cvalue')

                      setTimeout(function() {
                        iterator.next(function(err, key, value) {
                          t.notOk(err, 'no error')
                          t.notOk(key, 'end, no key')
                          t.notOk(value, 'end, no value')
                          t.end()
                        })
                      }, 1)
                    })
                  }, 1)
                })
              }, 1)
            })
          })
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

  tape('zero results if gt key > lt key', function(t) {
    var level = levelup('key-range-test', {db: leveljs})
    level.open(function(err) {
      t.notOk(err, 'no error')
      var s = level.createReadStream({ gte: 'x', lt: 'b' });
      var item;
      s.on('readable', function() {
        item = s.read()
      })
      s.on('end', function() {
        t.end()
      });
    })
  })

}
