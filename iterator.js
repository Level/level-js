var util = require('util')
var AbstractIterator  = require('abstract-leveldown').AbstractIterator
module.exports = Iterator

function Iterator (db, options) {
  if (!options) options = {}
  this.options = options
  AbstractIterator.call(this, db)
  this._order = !!options.reverse ? 'DESC': 'ASC'
  this._start = options.start
  this._end   = options.end
  this._done = false
}

util.inherits(Iterator, AbstractIterator)

Iterator.prototype.createIterator = function() {
  if (typeof this._start !== 'undefined' || typeof this._end !== 'undefined') {
    this._keyRange = this.options.keyRange || this.db.makeKeyRange({
      lower: this._start,
      upper: this._end
      // todo excludeUpper/excludeLower
    })
  }
  this.iterator = this.db.iterate(this.onItem.bind(this), {
    keyRange: this._keyRange,
    autoContinue: false,
    order: this._order,
    onError: function(err) { console.log('horrible error', err) },
  })
}

Iterator.prototype.onItem = function (cursor, cursorTransaction) {
  if (!cursor && this.callback) return this.callback()
  if (this.callback) this.callback(false, cursor.key, cursor.value)
  this.callback = false
  cursor.continue()
}

Iterator.prototype._next = function (callback) {
  if (!callback) return new Error('next() requires a callback argument')
  if (!this._started) {
    this.createIterator()
    this._started = true
  }
  this.callback = callback
}