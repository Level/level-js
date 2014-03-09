var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
module.exports = Iterator

function Iterator (db, options) {
  if (!options) options = {}
  this.options = options
  AbstractIterator.call(this, db)
  this._order = options.reverse ? 'DESC': 'ASC'
  this._start = options.start
  this._limit = options.limit
  this._count = 0
  this._end   = options.end
  this._done  = false
  this._gt    = options.gt
  this._gte   = options.gte
  this._lt    = options.lt
  this._lte   = options.lte
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.createIterator = function() {
  var self = this
  var lower, upper
  var onlyStart = typeof self._start !== 'undefined' && typeof self._end === 'undefined'
  var onlyEnd = typeof self._start === 'undefined' && typeof self._end !== 'undefined'
  var startAndEnd = typeof self._start !== 'undefined' && typeof self._end !== 'undefined'
  if (onlyStart) {
    var index = self._start
    if (self._order === 'ASC') {
      lower = index
    } else {
      upper = index
    }
  } else if (onlyEnd) {
    var index = self._end
    if (self._order === 'DESC') {
      lower = index
    } else {
      upper = index
    }
  } else if (startAndEnd) {
    lower = self._start
    upper = self._end
    if (self._start > self._end) {
      lower = self._end
      upper = self._start
    }
  }
  if (!lower) {
    if (self._gte !== 'undefined') lower = self._gte
    else if (self._gt !== 'undefined') lower = self._gt
  }
  if (!upper) {
    if (self._lte !== 'undefined') upper = self._lte
    else if (self._lt !== 'undefined') upper = self._lt
  }
  if (lower || upper) {
    self._keyRange = self.options.keyRange || self.db.makeKeyRange({
      lower: lower,
      upper: upper
      // TODO expose excludeUpper/excludeLower
    })
  }
  self.iterator = self.db.iterate(function () {
    self.onItem.apply(self, arguments)
  }, {
    keyRange: self._keyRange,
    autoContinue: false,
    order: self._order,
    onError: function(err) { console.log('horrible error', err) },
  })
}

// TODO the limit implementation here just ignores all reads after limit has been reached
// it should cancel the iterator instead but I don't know how
Iterator.prototype.onItem = function (value, cursor, cursorTransaction) {
  if (!cursor && this.callback) {
    this.callback()
    this.callback = false
    return
  }
  var shouldCall = true

  if (!!this._limit && this._limit > 0 && this._count++ >= this._limit)
    shouldCall = false

  if (  (this._lt  && cursor.key >= this._lt)
     || (this._lte && cursor.key > this._lte)
     || (this._gt  && cursor.key <= this._gt)
     || (this._gte && cursor.key < this._gte))
    shouldCall = false
  
  if (shouldCall) this.callback(false, cursor.key, cursor.value)
  if (cursor) cursor.continue()
}

Iterator.prototype._next = function (callback) {
  if (!callback) return new Error('next() requires a callback argument')
  if (!this._started) {
    this.createIterator()
    this._started = true
  }
  this.callback = callback
}
