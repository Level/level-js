module.exports = Level

var IDB = require('idb-wrapper')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var util = require('util')
var Iterator = require('./iterator')
var isBuffer = require('isbuffer')
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

Level.prototype._get = function (key, options, callback) {
  this.idb.get(key, function (value) {
    if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return callback(new Error('NotFound'))
    }

    if (options.asBuffer) {
      if (value instanceof Uint8Array) value = toBuffer(value)
      else value = Buffer.from(String(value))
    }

    return callback(null, value, key)
  }, callback)
}

Level.prototype._del = function(id, options, callback) {
  this.idb.remove(id, callback, callback)
}

Level.prototype._put = function (key, value, options, callback) {
  this.idb.put(key, value, function() { callback() }, callback)
}

// Valid key types in IndexedDB Second Edition:
//
// - Number, except NaN. Includes Infinity and -Infinity
// - Date, except invalid (NaN)
// - String
// - ArrayBuffer or a view thereof (typed arrays)
// - Array, except cyclical and empty (e.g. Array(10)). Elements must be valid
//   types themselves.
Level.prototype._serializeKey = function (key) {
  // TODO: do we still need to support ArrayBuffer?
  if (key instanceof ArrayBuffer) {
    key = Buffer.from(key)
    return Level.binaryKeys ? key : key.toString()
  } else if (Buffer.isBuffer(key)) {
    return Level.binaryKeys ? key : key.toString()
  } else if (Array.isArray(key)) {
    return key.map(this._serializeKey, this)
  } else if ((typeof key === 'number' || key instanceof Date) && !isNaN(key)) {
    return key
  }

  return String(key)
}

Level.prototype._serializeValue = function (value) {
  // TODO: do we still need to support ArrayBuffer?
  if (value instanceof ArrayBuffer) return Buffer.from(value)
  if (value == null) return ''

  return value
}

Level.prototype._iterator = function (options) {
  return new Iterator(this.idb, options)
}

Level.prototype._batch = function (array, options, callback) {
  var op
  var i
  var k
  var copiedOp
  var currentOp
  var modified = []

  if (array.length === 0) return setTimeout(callback, 0)

  for (i = 0; i < array.length; i++) {
    copiedOp = {}
    currentOp = array[i]
    modified[i] = copiedOp

    for (k in currentOp) {
      if (k === 'type' && currentOp[k] == 'del') {
        copiedOp[k] = 'remove'
      } else {
        copiedOp[k] = currentOp[k]
      }
    }
  }

  return this.idb.batch(modified, function(){ callback() }, callback)
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

var checkKeyValue = Level.prototype._checkKeyValue = function (obj, type) {
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (obj === null || obj === undefined)
    return new Error(type + ' cannot be `null` or `undefined`')
  if (isBuffer(obj) && obj.byteLength === 0)
    return new Error(type + ' cannot be an empty ArrayBuffer')
  if (String(obj) === '')
    return new Error(type + ' cannot be an empty String')
  if (obj.length === 0)
    return new Error(type + ' cannot be an empty Array')
}
