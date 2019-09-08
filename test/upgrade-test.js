'use strict'

var concat = require('level-concat-iterator')

module.exports = function (leveljs, test, testCommon) {
  test('upgrade', function (t) {
    var db = testCommon.factory()

    var input = [
      { key: -1, value: 'a' },
      { key: '0', value: ab('b') },
      { key: '1', value: 1 },
      { key: maybeBinary('2'), value: new Uint8Array(ab('2')) }
    ]

    var output = [
      { key: maybeBinary('-1'), value: new Uint8Array(ab('a')) },
      { key: maybeBinary('0'), value: new Uint8Array(ab('b')) },
      { key: maybeBinary('1'), value: new Uint8Array(ab('1')) },
      { key: maybeBinary('2'), value: new Uint8Array(ab('2')) }
    ]

    db.open(function (err) {
      t.ifError(err, 'no open error')

      // To bypass serialization, use _batch() instead of batch().
      db._batch(input.map(putOperation), {}, function (err) {
        t.ifError(err, 'no batch error')

        db.upgrade(function (err) {
          t.ifError(err, 'no upgrade error')

          concatRaw(function (err, entries) {
            t.ifError(err, 'no concat error')

            entries.forEach(function (entry) {
              if (db.supports.bufferKeys) {
                t.ok(entry.key instanceof ArrayBuffer)
              } else {
                t.is(typeof entry.key, 'string')
              }

              t.ok(entry.value instanceof Uint8Array)
            })

            t.same(entries.map(bufferEntry), output.map(bufferEntry))
            t.end()
          })
        })
      })
    })

    function maybeBinary (key) {
      return db.supports.bufferKeys ? ab(key) : String(key)
    }

    function concatRaw (callback) {
      var it = db.iterator()
      it._deserializeKey = it._deserializeValue = identity
      concat(it, callback)
    }

    function identity (data) {
      return data
    }

    function ab (data) {
      return Buffer.from(data).buffer
    }

    function bufferEntry (entry) {
      return { key: Buffer.from(entry.key), value: Buffer.from(entry.value) }
    }

    function putOperation (entry) {
      return { type: 'put', key: entry.key, value: entry.value }
    }
  })
}
