var default_port = process.env.PORT;

var sys = require('sys');
var express = require('express');
var jade = require('jade');

var Db = require('/home/node/node-mongodb-native/lib/mongodb').Db,
  Connection = require('/home/node/node-mongodb-native/lib/mongodb').Connection,
  Server = require('/home/node/node-mongodb-native/lib/mongodb').Server,
  BSON = require('/home/node/node-mongodb-native/lib/mongodb').BSONNative;

var host = 'localhost';
var port = 27017;
var db = new Db('visits', new Server(host, port, {}));

//db.open(function(err, db) { 

app = express.createServer();

app.get('/',function(req,res){
  var local_var = "I am a local var";
  jade.renderFile('views/index.jade', {locals:{local_var:local_var}} ,function(err,html){
    res.send(html);
  });
});

app.listen(default_port); 

console.log('Server running on default port');

