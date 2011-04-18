var default_port = process.env.PORT;

var http = require('http');
var sys = require('sys');

//var Db = require('./node-mongodb-native/lib/mongodb').Db,
//  Connection = require('./node-mongodb-native/lib/mongodb').Connection,
//  Server = require('./node-mongodb-native/lib/mongodb').Server,
//  BSON = require('./node-mongodb-native/lib/mongodb').BSONNative;

http.createServer( function(req, res) { 
  res.writeHead(200, {'Content-Type' : 'text/plain' });
  res.end('Hello World\n');
}).listen(default_port);

console.log('Server running on default port');

