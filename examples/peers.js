var net = require('net')
var serializer = require('stream-serializer')()
var repred = require('../')

function peer (address, initial) {
  var heartbeats = {}
  console.log(address)

  var rr = repred(function () {

    var c = {}
    rr.id = [address.host, address.port].join(':')
    c[rr.id] = Date.now()
    return c

  }, function (heatbeats, beat) {

    var change = {}
    for(var id in beat) {
      if(beat[id] > (heartbeats[id] || 0))
        change[id] = heartbeats[id] = beat[id]
    }
    return change

  }, heartbeats)

  function onConnect (stream) {
    stream.pipe(serializer(rr.createStream())).pipe(stream)
    stream.on('error', console.log)
  }
  net.createServer(onConnect).listen(address.port, address.host)


  if(initial)
    connectToPeer(initial)

  function connectToPeer (p) {
    console.log(address, '->', p)
    var stream = net.connect(p.port, p.host)
    onConnect(stream)
    setTimeout(function () {
      stream.destroy()
      var ts = Date.now()
      var peers = Object.keys(rr.collection)
        .filter(function (name) {
          return (rr.collection[name] > ts - 1e3)
        })
      console.log('UP', peers)
      peers = peers.map(function (e) {
          e = e.split(':')
          return {host: e[0], port: e[1]}
        })
      peers.push(initial)
      connectToPeer(peers[~~(Math.random()*peers.length)])
    
    }, 3e3)
  }

  rr.on('update', console.log)

  setInterval(function () {
    rr.update(rr.id)
  },1e3)

}

if(!module.parent) {
  peer({
    host: 'localhost', 
    port: + process.argv[2] }, 
    process.argv[3] && {
      host: 'localhost', 
      port: process.argv[3]
    }) 
}
