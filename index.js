'use strict'

module.exports = Level

var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var util = require('util')
var Iterator = require('./iterator')
var mixedToBuffer = require('./util/mixed-to-buffer')
var isDataCloneError = require('./util/is-data-clone-error')
var setImmediate = require('./util/immediate')
var support = require('./util/support')

var DEFAULT_PREFIX = 'level-js-'

function Level (location, opts) {
  if (!(this instanceof Level)) return new Level(location, opts)
  AbstractLevelDOWN.call(this, location)
  opts = opts || {}

  this.prefix = opts.prefix || DEFAULT_PREFIX
  this.version = parseInt(opts.version || 1, 10)
}

util.inherits(Level, AbstractLevelDOWN)

// Detect binary and array key support (IndexedDB Second Edition)
Level.binaryKeys = support.binaryKeys(indexedDB)
Level.arrayKeys = support.arrayKeys(indexedDB)

Level.prototype._open = function (options, callback) {
  var req = indexedDB.open(this.prefix + this.location, this.version)
  var self = this

  req.onerror = function () {
    callback(req.error || new Error('unknown error'))
  }

  req.onsuccess = function () {
    self.db = req.result
    callback()
  }

  req.onupgradeneeded = function (ev) {
    var db = ev.target.result

    if (!db.objectStoreNames.contains(self.location)) {
      db.createObjectStore(self.location)
    }
  }
}

Level.prototype.store = function (mode) {
  var transaction = this.db.transaction([this.location], mode)
  return transaction.objectStore(this.location)
}

Level.prototype.await = function (request, callback) {
  var transaction = request.transaction

  // Take advantage of the fact that a non-canceled request error aborts
  // the transaction. I.e. no need to listen for "request.onerror".
  transaction.onabort = function () {
    callback(transaction.error || new Error('aborted by user'))
  }

  transaction.oncomplete = function () {
    callback(null, request.result)
  }
}

Level.prototype._get = function (key, options, callback) {
  this.await(this.store('readonly').get(key), function (err, value) {
    if (err) return callback(err)

    if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return callback(new Error('NotFound'))
    }

    if (options.asBuffer) {
      value = mixedToBuffer(value)
    }

    callback(null, value)
  })
}

Level.prototype._del = function(key, options, callback) {
  this.await(this.store('readwrite').delete(key), callback)
}

Level.prototype._put = function (key, value, options, callback) {
  var store = this.store('readwrite')

  try {
    // Will throw a DataCloneError if the environment
    // does not support serializing the key or value.
    var req = store.put(value, key)
  } catch (err) {
    if (!isDataCloneError(err)) {
      throw err
    }

    return setImmediate(function () {
      callback(err)
    })
  }

  this.await(req, callback)
}

// Valid key types in IndexedDB Second Edition:
//
// - Number, except NaN. Includes Infinity and -Infinity
// - Date, except invalid (NaN)
// - String
// - ArrayBuffer or a view thereof (typed arrays). In level-js we only support
//   Buffer (which is an Uint8Array).
// - Array, except cyclical and empty (e.g. Array(10)). Elements must be valid
//   types themselves.
Level.prototype._serializeKey = function (key) {
  if (Buffer.isBuffer(key)) {
    return Level.binaryKeys ? key : key.toString()
  } else if (Array.isArray(key)) {
    return Level.arrayKeys ? key.map(this._serializeKey, this) : String(key)
  } else if ((typeof key === 'number' || key instanceof Date) && !isNaN(key)) {
    return key
  }

  return String(key)
}

Level.prototype._serializeValue = function (value) {
  return value == null ? '' : value
}

Level.prototype._iterator = function (options) {
  return new Iterator(this.db, this.location, options)
}

Level.prototype._batch = function (operations, options, callback) {
  if (operations.length === 0) return setImmediate(callback)

  var store = this.store('readwrite')
  var transaction = store.transaction
  var index = 0

  transaction.onabort = function () {
    callback(transaction.error || new Error('aborted by user'))
  }

  transaction.oncomplete = function () {
    callback()
  }

  // Wait for a request to complete before making the next, saving CPU.
  function loop () {
    var op = operations[index++]
    var key = op.key
    var req = op.type === 'del' ? store.delete(key) : store.put(op.value, key)

    if (index < operations.length) {
      req.onsuccess = loop
    }
  }

  loop()
}

Level.prototype._close = function (callback) {
  this.db.close()
  callback()
}

Level.destroy = function (db, callback) {
  if (typeof db === 'object') {
    var prefix = db.prefix || DEFAULT_PREFIX
    var location = db.location
  } else {
    prefix = DEFAULT_PREFIX
    location = db
  }
  var request = indexedDB.deleteDatabase(prefix + location)
  request.onsuccess = function() {
    callback()
  }
  request.onerror = function(err) {
    callback(err)
  }
}
