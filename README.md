# repred

Insanely simple data replication.

<img src=https://secure.travis-ci.org/dominictarr/repred.png?branch=master>

## Example

Pass in a reduce like function that merges an update into the node's collection.

``` js
var repred = require('repred')

var rr = repred(function (collect, update) {
  var change = []
  update.forEach(function (name) {
    if(!~collect.indexOf(name)) {
      change.push(name)
      collect.push(name)
    }
    return change
  })
}, [])

//handle change events
rr.on('update', console.log)
//add a name to the set.
rr.update('jim')
```

The function must also return a change object, which is just the changes which actually applied.
if changes is non-empty, (not `[]` or `{}`) then that update will be sent across the wire to any 
connected nodes.

  1. write a map-reduce that is commutative and idempotent.
  2. distribute them, and connect them via streams.
  3. Eventual Consistency!

connect like this:

``` js
rs1 = rr1.createStream()
rs2 = rr2.createStream()

rs1.pipe(rs2).pipe(rs1)
```
or, through a tcp stream...

``` js
var net = require('net')

//on server...
var rr1 = reprep(...)

net.createServer(function (stream) {
  stream.pipe(rr1.createStream()).pipe(stream)
}).listen(PORT)

//on client...
var rr2 = reprep(...)

var stream = net.connect(PORT)
stream.pipe(rr2.createStream()).pipe(stream)
```

## map-reduce

Optionally pass in a `map` function to transform update into the correct type.
if the return value of the map is `nullish` (null or undefined) reduce will not be called.
``` js

var rr = reprep(function map (whatever) {
    return whatever && whatever.name ? [whatever.name] : null
  },
  function reduce (acc, names) {
    var changes = []
    names.forEach(function (name) {
      if(~acc.indexOf(name)) return
      acc.push(name)
      changes.push(name)
    })
    return changes
  })

rr.update({name: 'jim', phone: ...}) //etc.
```

## License

MIT
