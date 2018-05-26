'use strict'

var LEGACY_CODE = 25

module.exports = function (err) {
  return err.name === 'DataCloneError' || err.code === LEGACY_CODE
}
