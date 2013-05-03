var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
module.exports = Iterator

function Iterator (db, options) {
  if (!options) options = {}
  AbstractIterator.call(this, db)
  this._order = !!options.reverse ? 'DESC': 'ASC'
  this._start = options.start
  this._end   = options.end
  if (typeof this._start === 'undefined' && typeof this._end === 'undefined')
    return new Error('must pass in a start or end')
  this._done = false
  this._keyRange = options.keyRange || db.makeKeyRange({
    lower: this._start,
    upper: this._end
    // todo excludeUpper/excludeLower
  })
  this.db.iterate(this.onItem.bind(this), {
    keyRange: this._keyRange,
    autoContinue: false,
    order: this._order,
    onEnd: this._next.bind(this)
  })
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.onItem = function (value, cursor, cursorTransaction, next) {
  if (this.pendingCallback) {
    if (arguments.length === 0) return setImmediate(this.pendingCallback.bind(null, null, null))
    setImmediate(this.pendingCallback.bind(null, null, cursor, value, cursorTransaction))
    next()
  } else {
    if (arguments.length === 0) return this._done = true
    this._last = [cursor, value, cursorTransaction]
    this._next = next
  }
}

Iterator.prototype._next = function (callback) {
  if (!callback) return new Error('next() requires a callback argument')
  if (this._next) {
    setImmediate(callback.bind(null, null, this._last[0], this._last[1], this._last[2]))
    this._next()
    this._next = false
  } else {
    this.pendingCallback = callback
  }
}