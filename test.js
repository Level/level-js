var tape   = require('tape')
  , leveljs = require('./')
  , factory = function (location) {
      return leveljs(location)
    }
  , testCommon = require('./testCommon')

var str = 'foo'
var testBuffer = new ArrayBuffer(str.length * 2)
var bufView = new Uint16Array(testBuffer);
for (var i = 0, strLen = str.length; i < strLen; i++) {
  bufView[i] = str.charCodeAt(i)
}


/*** compatibility with basic LevelDOWN API ***/

require('abstract-leveldown/abstract/leveldown-test').args(factory, tape, testCommon)
require('abstract-leveldown/abstract/open-test').args(factory, tape, testCommon)
require('abstract-leveldown/abstract/open-test').open(factory, tape, testCommon)
require('abstract-leveldown/abstract/put-test').all(factory, tape, testCommon)
require('abstract-leveldown/abstract/del-test').all(factory, tape, testCommon)
require('abstract-leveldown/abstract/get-test').all(factory, tape, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(factory, tape, testCommon, testBuffer)
require('abstract-leveldown/abstract/batch-test').all(factory, tape, testCommon)
// require('abstract-leveldown/abstract/chained-batch-test').all(factory, tape, testCommon)
require('abstract-leveldown/abstract/close-test').close(factory, tape, testCommon)
require('abstract-leveldown/abstract/iterator-test').all(factory, tape, testCommon)

