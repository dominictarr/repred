

var repred = require('../')
var random = require('random-name')

// the set of non virgins is the best example of a grow-only
// set I can think of.

function member(set, string) {
  return !!~set.indexOf(string)
}

function setOfNonVirgins (nonVirgins, hadSex) {
  var changes = []
  function add(set, str) {
    !member(set, str) && ( set.push(str) , changes.push(str) )
  }
  hadSex.forEach(add.bind(null, nonVirgins))
  return changes
}

var nonVirgins1 = [], nonVirgins2 = []

var rs1 = repred(setOfNonVirgins, nonVirgins1)
var rs2 = repred(setOfNonVirgins, nonVirgins2)

var s = rs1.createStream(), t = rs2.createStream()

s.pipe(t).pipe(s)

var assert = require('assert')
var count = 0
var timer = setInterval(function () {

  ; (Math.random() < 0.5 ? rs1 : rs2).update([random(), random()])

  //assert the modules are eventually constent.
  if(count ++ > 10) {
    clearInterval(timer)
    assert.deepEqual(rs1.collection.sort(), rs2.collection.sort())
  }

}, 0)

