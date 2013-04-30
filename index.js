module.exports = Level

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)
  if (arguments.length === 0 || arguments[0] === undefined)
    throw new Error("leveldown() requires at least a location argument")
}

Level.prototype.open = function(cb) {
  if (!cb || typeof cb !== 'function')
    throw new Error("open() requires a callback argument")
  
}