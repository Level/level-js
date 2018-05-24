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

function Iterator (db, storeName, options) {
  AbstractIterator.call(this, db)

  this._limit = options.limit
  this._count = 0
  this._callback = null
  this._cache = []
  this._completed = false
  this._transaction = null

  this._keyAsBuffer = options.keyAsBuffer
  this._valueAsBuffer = options.valueAsBuffer

  if (this._limit === 0) {
    this._completed = true
    return
  }

  try {
    var keyRange = this.createKeyRange(options)
  } catch (e) {
    // The lower key is greater than the upper key.
    // IndexedDB throws an error, but we'll just return 0 results.
    this._completed = true
    return
  }

  this.createIterator(storeName, keyRange, options.reverse)
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.createKeyRange = function (options) {
  var lower = ltgt.lowerBound(options)
  var upper = ltgt.upperBound(options)
  var lowerOpen = ltgt.lowerBoundExclusive(options)
  var upperOpen = ltgt.upperBoundExclusive(options)

  if (lower !== undefined && upper !== undefined) {
    return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)
  } else if (lower !== undefined) {
    return IDBKeyRange.lowerBound(lower, lowerOpen)
  } else if (upper !== undefined) {
    return IDBKeyRange.upperBound(upper, upperOpen)
  } else {
    return null
  }
}

Iterator.prototype.createIterator = function (storeName, keyRange, reverse) {
  var self = this
  var transaction = this.db.transaction([storeName], 'readonly')
  var store = transaction.objectStore(storeName)
  var req = store.openCursor(keyRange, reverse ? 'prev' : 'next')

  req.onsuccess = function (ev) {
    var cursor = ev.target.result
    if (cursor) self.onItem(cursor)
  }

  this._transaction = transaction

  // If an error occurs, the transaction will abort and we can
  // get the error from "transaction.error".
  transaction.oncomplete = transaction.onabort = function () {
    self.onComplete()
  }
}

Iterator.prototype.onItem = function (cursor) {
  this._cache.push(cursor.key, cursor.value)

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

  if (this._transaction !== null && this._transaction.error !== null) {
    var err = this._transaction.error

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

  var transaction = this._transaction

  // Don't advance the cursor anymore, and the transaction will complete
  // on its own in the next tick. This approach is much cleaner than calling
  // transaction.abort() with its unpredictable event order.
  this.onItem = noop
  this.onComplete = function () {
    callback(transaction.error)
  }
}
