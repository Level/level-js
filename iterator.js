var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
var ltgt = require('ltgt')

module.exports = Iterator

function Iterator (db, options) {
  if (!options) options = {}
  this.options = options
  AbstractIterator.call(this, db)
  this._order = options.reverse ? 'DESC': 'ASC'
  this._limit = options.limit;
  if (this._limit == null || this._limit === -1) {
    this._limit = Infinity;
  }
  if (typeof this._limit !== 'number') throw new TypeError('options.limit must be a number')
  if (this._limit === 0) return // skip further processing and wait for first call to _next

  this._count = 0
  this._done  = false
  var lower = ltgt.lowerBound(options)
  var upper = ltgt.upperBound(options)
  try {
    this._keyRange = lower || upper ? this.db.makeKeyRange({
      lower: lower,
      upper: upper,
      excludeLower: ltgt.lowerBoundExclusive(options),
      excludeUpper: ltgt.upperBoundExclusive(options)
    }) : null
  } catch (err) {
    // The lower key is greater than the upper key.
    // IndexedDB throws a DataError, but we'll just skip the iterator and return 0 results.
    this._keyRangeError = true
    return;
  }
  this.callback = null

  var self = this

  self.iterator = self.db.iterate(function () {
    self.onItem.apply(self, arguments)
  }, {
    keyRange: self._keyRange,
    autoContinue: false,
    order: self._order,
    onError: function(err) { console.error('horrible error', err) }
  });

  self.iterator.oncomplete = function () {
    self._cursorEnded = true;
    if (self.callback) self.callback()
  }
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.onItem = function (value, cursor, cursorTransaction) {
  var self = this;
  function emitAndContinue(cb) {
    if (!cursor) {
      cb()
      return
    }

    self._count++;

    var key = self.options.keyAsBuffer !== false
      ? Buffer(cursor.key)
      : cursor.key
    var value = self.options.valueAsBuffer !== false
      ? Buffer(cursor.value)
      : cursor.value
    cb(null, key, value)
    if (!self._cursorEnded) {
      // IDBWrapper.limit only works if autoContinue is true
      if (self._count < self._limit) cursor['continue']() // else timeout
    }
  }

  if (this.callback) {
    emitAndContinue(this.callback)
    this.callback = false
  } else {
    // wait for next handler
    this._emitAndContinue = emitAndContinue
  }
}

Iterator.prototype._next = function (callback) {
  if (this._keyRangeError || this._limit === 0) return callback()

  if (this._emitAndContinue) {
    this._emitAndContinue(callback)
    this._emitAndContinue = false
  } else {
    // wait for cursor
    this.callback = callback
  }
}
