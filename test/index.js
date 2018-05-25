// Promise polyfill for IE and others.
if (process.browser && typeof Promise !== 'function') {
  global.Promise = require('pinkie')
}

require('./test')
require('./test-levelup')
