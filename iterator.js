var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
var ltgt = require('ltgt')
var toBuffer = require('typedarray-to-buffer')

// TODO: move this to a util, to be used by get() and iterators.
function mixedToBuffer (value) {
  if (value instanceof Uint8Array) return toBuffer(value)
  else return Buffer.from(String(value))
}

module.exports = Iterator

function Iterator (db, options) {
  // TODO: in later abstract-leveldown, options is always an object.
  if (!options) options = {}
  AbstractIterator.call(this, db)

  this._order = options.reverse ? 'DESC': 'ASC'
  this._limit = options.limit
  this._count = 0
  this._callback = null
  this._cache = []
  this._finished = false

  // TODO: in later abstract-leveldown, these have proper defaults
  this._keyAsBuffer = options.keyAsBuffer !== false
  this._valueAsBuffer = options.valueAsBuffer !== false

  var lower = ltgt.lowerBound(options)
  var upper = ltgt.upperBound(options)

  try {
    this._keyRange = lower || upper ? this.db.makeKeyRange({
      lower: lower,
      upper: upper,
      excludeLower: ltgt.lowerBoundExclusive(options),
      excludeUpper: ltgt.upperBoundExclusive(options)
    }) : null
  } catch (e) {
    // The lower key is greater than the upper key.
    // IndexedDB throws an error, but we'll just return 0 results.
    this._finished = true
    return
  }

  this.createIterator()
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.createIterator = function() {
  var self = this

  self.iterator = self.db.iterate(function () {
    self.onItem.apply(self, arguments)
  }, {
    keyRange: self._keyRange,
    autoContinue: false,
    order: self._order,
    onError: function(err) {
      if (err.type !== 'abort' && !self._ended) {
        // TODO: pass to next() callback
        console.error('horrible error', err)
      }
    }
  })
}

Iterator.prototype.onItem = function (value, cursor, cursorTransaction) {
  if (!cursor) {
    this._finished = true
  } else if (!!this._limit && this._limit > 0 && this._count++ >= this._limit) {
    cursorTransaction.abort()
    this._finished = true
  } else {
    this._cache.push(cursor.key, value)
    cursor['continue']()
  }

  if (this._callback) {
    this._next(this._callback)
    this._callback = null
  }
}

// TODO: use setImmediate (see memdown)
Iterator.prototype._next = function (callback) {
  // TODO: can remove this after upgrading abstract-leveldown
  if (!callback) throw new Error('next() requires a callback argument')

  if (this._cache.length > 0) {
    var key = this._cache.shift()
    var value = this._cache.shift()

    if (this._keyAsBuffer) key = mixedToBuffer(key)
    if (this._valueAsBuffer) value = mixedToBuffer(value)

    setTimeout(function() {
      callback(null, key, value)
    }, 0)
  } else if (this._finished) {
    setTimeout(callback, 0)
  } else {
    this._callback = callback
  }
}

// TODO: use setImmediate (see memdown)
Iterator.prototype._end = function (callback) {
  if (!this._finished) this.iterator.abort()
  setTimeout(callback, 0)
}
