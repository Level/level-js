'use strict'

var bytes = [0, 127]

// Replacement for TypedArray.from(bytes)
module.exports = function (TypedArray) {
  var arr = new TypedArray(bytes.length)
  for (var i = 0; i < bytes.length; i++) arr[i] = bytes[i]
  return arr
}
