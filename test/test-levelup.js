/*** Levelup tests
  (the actual test suite isnt runnable in browser, and these arent complete)
***/
var levelup = require('levelup')
var leveljs = require('../')

window.db = levelup('foo', { db: leveljs })

db.put('name', 'LevelUP string', function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error
  db.get('name', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found
    console.log('name=' + value)
  })
})

var ary = new Uint8Array(1)
ary[0] = 1
db.put('binary', ary, function (err) {
  if (err) return console.log('Ooops!', err) // some kind of I/O error
  db.get('binary', function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found
    console.log('binary', value)
  })
})
