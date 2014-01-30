var tape   = require('tape')
  , leveljs = require('./')
  , testCommon = require('./testCommon')

var str = 'foo'
var testBuffer = new ArrayBuffer(str.length * 2)
var bufView = new Uint16Array(testBuffer);
for (var i = 0, strLen = str.length; i < strLen; i++) {
  bufView[i] = str.charCodeAt(i)
}


/*** compatibility with basic LevelDOWN API ***/
require('abstract-leveldown/abstract/leveldown-test').args(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/open-test').args(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/open-test').open(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/put-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/del-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/get-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(leveljs, tape, testCommon, testBuffer)
require('abstract-leveldown/abstract/batch-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/chained-batch-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/close-test').close(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/iterator-test').all(leveljs, tape, testCommon)
require('abstract-leveldown/abstract/ranges-test').all(leveljs, tape, testCommon)
