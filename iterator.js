var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
var ltgt = require('ltgt')
var toBuffer = require('typedarray-to-buffer')
var noop = function () {}

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
  this._limit = options.limit || -1
  this._count = 0
  this._callback = null
  this._cache = []
  this._completed = false

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
    this._completed = true
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

    // If an error occurs, the transaction will abort and we can
    // get the error from "transaction.error".
    onError: noop
  })

  // Override IDBWrapper's event handlers for a simpler flow.
  self.iterator.oncomplete = self.iterator.onabort = function () {
    self.onComplete()
  }
}

Iterator.prototype.onItem = function (value, cursor, cursorTransaction) {
  this._cache.push(cursor.key, value)

  if (this._limit <= 0 || ++this._count < this._limit) {
    cursor['continue']()
  }

  this.maybeNext()
}

Iterator.prototype.onComplete = function () {
  this._completed = true
  this.maybeNext()
}

Iterator.prototype.maybeNext = function () {
  if (this._callback) {
    this._next(this._callback)
    this._callback = null
  }
}

// TODO: use setImmediate (see memdown)
Iterator.prototype._next = function (callback) {
  // TODO: can remove this after upgrading abstract-leveldown
  if (!callback) throw new Error('next() requires a callback argument')

  if (this.iterator.error !== null) {
    var err = this.iterator.error

    setTimeout(function() {
      callback(err)
    }, 0)
  } else if (this._cache.length > 0) {
    var key = this._cache.shift()
    var value = this._cache.shift()

    if (this._keyAsBuffer) key = mixedToBuffer(key)
    if (this._valueAsBuffer) value = mixedToBuffer(value)

    setTimeout(function() {
      callback(null, key, value)
    }, 0)
  } else if (this._completed) {
    setTimeout(callback, 0)
  } else {
    this._callback = callback
  }
}

// TODO: use setImmediate (see memdown)
Iterator.prototype._end = function (callback) {
  if (this._completed) {
    setTimeout(callback, 0)
    return
  }

  var iterator = this.iterator

  // Don't advance the cursor anymore, and the transaction will complete
  // on its own in the next tick. This approach is much cleaner than calling
  // transaction.abort() with its unpredictable event order.
  this.onItem = noop
  this.onComplete = function () {
    callback(iterator.error)
  }
}
