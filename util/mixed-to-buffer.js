'use strict'

var toBuffer = require('typedarray-to-buffer')

module.exports = function (value) {
  if (value instanceof Uint8Array) return toBuffer(value)
  else return Buffer.from(String(value))
}
