module.exports = Level

var IDB = require('idb-wrapper')

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)
  if (!location) throw new Error("leveldown() requires at least a location argument")
  
  this.location = location
}

Level.prototype.open = function(callback) {
  var self = this
  if (!callback || typeof callback !== 'function') throw new Error("open() requires a callback argument")
  
  this.idb = new IDB({
    storeName: this.location,
    onStoreReady: function () {
      callback && callback(null, self.idb)
    }, 
    onError: function(err) {
      callback && callback(err)
    }
  })
}

Level.prototype.get = function (key, options, callback) {
  if (typeof options == 'function') callback = options
  if (typeof callback != 'function') throw new Error('get() requires a callback argument')
  var err = checkKeyValue(key, 'key')
  if (err) return callback(err)
  if (!isBuffer(key)) key = String(key)
  if (typeof options != 'object') options = {}
  
  return this._get(key, options, callback)
}

Level.prototype._get = function (key, options, callback) {
  this.idb.get(key, function (value) {
    if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return callback(new Error('NotFound'))
    }
    value = value.value // because IDBWrapper returns a {}
    if (options.asBuffer !== false && !isBuffer(value))
      value = StringToArrayBuffer(String(value))
    return callback(null, value, key)
  }, callback)
}

Level.prototype.del = function (key, options, callback) {
  if (typeof options == 'function') callback = options
  if (typeof callback != 'function') throw new Error('del() requires a callback argument')
  var err = checkKeyValue(key, 'key')
  if (err) return callback(err)
  if (!isBuffer(key)) key = String(key)
  if (typeof options != 'object') options = {}
  return this._del(key, options, callback)
}

Level.prototype._del = function(id, options, callback) {
  this.idb.remove(id, callback, callback)
}

Level.prototype.put = function (key, value, options, callback) {
  if (typeof options == 'function')
    callback = options
  if (typeof callback != 'function')
    throw new Error('put() requires a callback argument')
  var err = checkKeyValue(value, 'value')
  if (err) return callback(err)
  err = checkKeyValue(key, 'key')
  if (err) return callback(err)
  if (!isBuffer(key)) key = String(key)
  // if (!isBuffer(value)) value = String(value)
  if (typeof options != 'object') options = {}

  return this._put(key, value, options, callback)
}

Level.prototype._put = function (key, value, options, callback) {
  var obj = {
    value: value,
    id: key
  }
  this.idb.put(obj, function() { callback() }, callback)
}

Level.prototype.close = function (callback) {
  if (typeof callback != 'function') throw new Error('close() requires a callback argument')
  return this._close(callback)
}

Level.prototype._close = function (callback) {
  this.idb.db.close()
  callback()
}

function isBuffer(buf) {
  return buf instanceof ArrayBuffer
}

function ArrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

function StringToArrayBuffer(str) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function checkKeyValue (obj, type) {
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