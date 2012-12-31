var duplex = require('duplex')
var EventEmitter = require('events').EventEmitter
var serializer   = require('stream-serializer')

function isEmpty (o) {
  if(null == o || null === false) return true
  if(Array.isArray(o)) return !o.length
  if('object' !== typeof o) return true
  for( var k in o) return false
  return true
}

module.exports = function (opts) {

  var args = [].slice.call(arguments)
  var initial = args.pop() 
  var reduce = args.pop() 
  var map = args.pop()
  if(!initial)
    throw new Error('initial is required')
  if(!reduce)
    throw new Error('reducer is required')
  
  var emitter = new EventEmitter ()

  emitter.id = ''+Math.random()
  emitter.setMaxListeners(Infinity)
  emitter.collection = initial

  emitter.createStream = function (opts) {
    var d = duplex()
    var remote = null

    serializer(opts && opts.wrapper)(d)
    
    d
      .on('_data', function (data) {
        if(!remote) return console.log('REMOTE', remote = data)
        emitter._update(data, remote)
        //reduce should mutate current, and 
      })
      .on('_end', function () {
        d.sendEnd()
      })
      .on('close', function () {
        emitter.removeListener('update', onUpdate)
      })

    function onUpdate(change, id) {
      if(id !== remote)
        d._data(change)
    }

    emitter.on('update', onUpdate)
    //duplex doesn't send any data until next tick
    //send what node this is.
    d._data(emitter.id)

    //send the current state.
    d._data(emitter.collection)

    console.log(d.buffer)
    return d
  }
  emitter._update = function (data, id) {
    if(data == null) return
    var change = reduce.call (emitter, emitter.collection, data)
    if(isEmpty(change)) return
    emitter.emit('update', change, id || emitter.id)
    return this
  }

  emitter.update = function (data) {
    emitter._update(
      map ? map.apply(this, [].slice.call(arguments)) : data
    , emitter.id)
    return this
  }

  return emitter
}
