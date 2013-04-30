module.exports = Level

function Level(location) {
  if (!(this instanceof Level)) return new Level(location)
  
  switch(arguments.length){
    case 0 :
      throw new Error("leveldown() requires at least a location argument")
      break;
    case 1 :
      if(arguments[0] == undefined)
        throw new Error("leveldown() requires at least a location argument")
      break;
  }
  
}

Level.prototype.open = function() {}