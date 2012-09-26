
var repred = require('./')

module.exports = function () {

var reducer = repred(
function  (big, little) {
  var changes = []
  function add(set, str) {
    return !~set.indexOf(str) && set.push(str) , changes.push(str)
    
  }
  little.forEach(add.bind(null, big))
  return changes
}
  
}
