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

db.open(function(err, db) { 
  var app = express.createServer();

  app.use(app.router);
  app.set('views', __dirname + '/views');

  app.get('/', function (req, res, next) {

    // get IP address and ts and query object
    global.inData = { };
    global.inData.ip = req.connection.remoteAddress;
    global.inData.ts = parseInt(new Date().valueOf());
    global.inData.qs = require('url').parse(req.url, true);

    db.collection('views', function(err, collection) { 
        if (err) {
            console.log('is error \n' + err);
        }

        collection.insert(global.inData);

        collection.find({}, {limit:5, sort:[ ['ts','desc'] ] }).toArray( function(err, docs) {
//          res.writeHead(200, {'Content-Type': 'text/plain'});
//          res.write("Last Five Requests\n");
//          for(var i in docs){
//            res.write(i + "\n");
//            res.write(JSON.stringify(docs[i], null, '\t'));
//            res.write("\n\n");
//          }
          jade.render('index.jade', docs);
//          res.end("");
          //db.close();  // DO NOT CLOSE THE CONNECTION
        });
    }); 
  });

  app.listen(default_port); 
});

console.log('Server running on default port');

