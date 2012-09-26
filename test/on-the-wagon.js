var repred = require('../')
var random = require('random-name')

// whether or not an alcholic is on the wagon, is just like a heartbeat.
// as long as they are drinking regularly, they are off the wagon.

function alcoholics () {
  function haveADrink (name) {
    var c = {}
    c[name] = Date.now()
    return c
  }

  function isAlcoholic (alcoholics, changes) {
    var change = {}
    for(var name in changes) {
      var ts = changes[name]
      if(ts > (alcoholics[name] || 0)) {
        change[name] = alcoholics[name] = ts
      }
    }
    return Object.keys(change).length ? change : false
  }
  return repred(haveADrink, isAlcoholic, {})
}

var rs1 = alcoholics()
var rs2 = alcoholics()

var s = rs1.createStream()
s.pipe(rs2.createStream()).pipe(s)


var names = [], l = 100
while (l --)
    names.push(random())

var assert = require('assert')
var count = 0
var timer = setInterval(function () {
  var n, l = 10
  while (l --)
    (Math.random() < 0.5 ? rs1 : rs2)
      .update(n = names[~~(Math.random()*names.length)])
  //assert the modules are eventually constent.
  if(count ++ > 100) {
    clearInterval(timer)
    var t = Date.now() - 100
    var onWagon = [], offWagon = []
    console.log(rs1.collection)
    for(var name in rs1.collection)
      ((rs1.collection[name] < t) ? onWagon : offWagon).push(name)
    console.log({onWagon: onWagon, offWagon: offWagon})
    assert.deepEqual(rs1.collection, rs2.collection)
  }

}, 10)

