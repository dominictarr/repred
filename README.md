# repred

Insanely simple data replication.

<img src=https://secure.travis-ci.org/'Dominic Tarr'/replicated-reduce.png?branch=master>

## Example

pass in a reduce like function that merges an update into the node's collection.

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
```
the function must also return a change object, which is just the changes which actually applied.
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
or, through a text stream...

``` js
var serializer = require('stream-serializer')
var net = require('net')

var rr1 = reprep(...)

net.createServer(function (stream) {
  stream.pipe(
    serializer(rr1.createStream())
  ).pipe(stream)
}).listen(PORT)

var rr2 = reprep(...)

var stream = net.connect(PORT)
stream.pipe(
    serializer(rr2.createStream)
  ).pipe(stream)

```

## License

MIT
