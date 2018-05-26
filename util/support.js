'use strict'

exports.binaryKeys = function (impl) {
  try {
    impl.cmp(new Uint8Array(0), 0)
    return true
  } catch (err) {
    return false
  }
}

exports.arrayKeys = function (impl) {
  try {
    impl.cmp([1], 0)
    return true
  } catch (err) {
    return false
  }
}
