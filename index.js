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
    // by default return buffers, unless explicitly told not to
    var asBuffer = true
    if (options.asBuffer === false) asBuffer = false
    if (options.raw) asBuffer = false
    if (asBuffer) {
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
  // TODO: once we upgrade abstract-leveldown, it will call _serializeValue for us.
  value = this._serializeValue(value, options)
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
  if (key instanceof ArrayBuffer) return Buffer.from(key)

  if (typeof key === 'string' || Buffer.isBuffer(key)) {
    return key
  }

  if (Array.isArray(key)) {
    return key.map(this._serializeKey, this)
  }

  if ((typeof key === 'number' || key instanceof Date) && !isNaN(key)) {
    return key
  }

  return String(key)
}

// NOTE: doesn't match abstract signature yet (which has no options argument).
Level.prototype._serializeValue = function (value, options) {
  // TODO: do we still need to support ArrayBuffer?
  if (value instanceof ArrayBuffer) return Buffer.from(value)
  if (value == null) return ''

  // TODO: remove
  if (options.raw) return value

  // TODO: remove
  if (typeof value !== 'object') return value.toString()

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

    // TODO: once we upgrade abstract-leveldown, it will call _serializeValue for us.
    currentOp.value = this._serializeValue(currentOp.value, options)

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
