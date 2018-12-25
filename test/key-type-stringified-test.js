'use strict'

// Key types that are not supported by IndexedDB Second Edition, but get
// stringified for abstract-leveldown compatibility.
var stringifiedTypes = [
  { name: 'true', input: true, output: 'true' },
  { name: 'false', input: false, output: 'false' },
  { name: 'NaN', input: NaN, output: 'NaN' }
]

module.exports = function (leveljs, test, testCommon) {
  test('setUp', testCommon.setUp)

  stringifiedTypes.forEach(function (item) {
    test('stringified key type: ' + item.name, function (t) {
      var db = testCommon.factory()

      db.open(function (err) {
        t.ifError(err, 'no open error')

        db.put(item.input, 'value', function (err) {
          t.ifError(err, 'no put error')

          var it = db.iterator({ keyAsBuffer: false, valueAsBuffer: false })

          testCommon.collectEntries(it, function (err, entries) {
            t.ifError(err, 'no iterator error')
            t.same(entries, [{ key: item.output, value: 'value' }])

            db.close(t.end.bind(t))
          })
        })
      })
    })
  })

  test('tearDown', testCommon.tearDown)
}
