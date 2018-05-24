module.exports = Level

var IDB = require('idb-wrapper')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var util = require('util')
var Iterator = require('./iterator')
var xtend = require('xtend')
var toBuffer = require('typedarray-to-buffer')

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)
  AbstractLevelDOWN.call(this, location)
  this.IDBOptions = {}
  this.location = location
}

util.inherits(Level, AbstractLevelDOWN)

// Detect binary key support (IndexedDB Second Edition)
Level.binaryKeys = (function () {
  if (typeof indexedDB === 'undefined') {
    return false
  }

  try {
    indexedDB.cmp(new Uint8Array(0), 0)
    return true
  } catch (err) {
    return false
  }
})()

Level.prototype._open = function(options, callback) {
  var self = this

  var idbOpts = {
    storeName: this.location,
    autoIncrement: false,
    keyPath: null,
    onStoreReady: function () {
      callback && callback(null, self.idb)
    },
    onError: function(err) {
      callback && callback(err)
    }
  }

  xtend(idbOpts, options)
  this.IDBOptions = idbOpts
  this.idb = new IDB(idbOpts)
}

Level.prototype.store = function (mode) {
  var storeName = this.idb.storeName
  var transaction = this.idb.db.transaction([storeName], mode)

  return transaction.objectStore(storeName)
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
      if (value instanceof Uint8Array) value = toBuffer(value)
      else value = Buffer.from(String(value))
    }

    callback(null, value)
  })
}

Level.prototype._del = function(key, options, callback) {
  this.await(this.store('readwrite').delete(key), callback)
}

Level.prototype._put = function (key, value, options, callback) {
  this.await(this.store('readwrite').put(value, key), callback)
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
    return key.map(this._serializeKey, this)
  } else if ((typeof key === 'number' || key instanceof Date) && !isNaN(key)) {
    return key
  }

  return String(key)
}

Level.prototype._serializeValue = function (value) {
  return value == null ? '' : value
}

Level.prototype._iterator = function (options) {
  return new Iterator(this.idb, options)
}

Level.prototype._batch = function (operations, options, callback) {
  if (operations.length === 0) return setTimeout(callback, 0)

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
  this.idb.db.close()
  callback()
}

Level.destroy = function (db, callback) {
  if (typeof db === 'object') {
    var prefix = db.IDBOptions.storePrefix || 'IDBWrapper-'
    var dbname = db.location
  } else {
    var prefix = 'IDBWrapper-'
    var dbname = db
  }
  var request = indexedDB.deleteDatabase(prefix + dbname)
  request.onsuccess = function() {
    callback()
  }
  request.onerror = function(err) {
    callback(err)
  }
}
