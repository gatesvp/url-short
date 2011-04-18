var default_port = process.env.PORT;

var http = require('http');
var sys = require('sys');

var Db = require('/home/node/node-mongodb-native/lib/mongodb').Db,
  Connection = require('/home/node/node-mongodb-native/lib/mongodb').Connection,
  Server = require('/home/node/node-mongodb-native/lib/mongodb').Server,
  BSON = require('/home/node/node-mongodb-native/lib/mongodb').BSONNative;

var host = 'localhost';
var port = 27017;
var db = new Db('visits', new Server(host, port, {}));

db.open(function(err, db) { 
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});

        global.inData = { };

        // get IP address and ts
        global.inData.ip = req.connection.remoteAddress;
        global.inData.ts = new Date().valueOf();

        // get the http query
        var qs = require('url').parse(req.url, true);
        global.inData.qs = qs;

        db.collection('views', function(err, collection) { 
            if (err) {
                console.log('is error \n' + err);
            }

            collection.insert(global.inData);
            res.end("IP recorded");
            //db.close();  // DO NOT CLOSE THE CONNECTION
        }); 
    }
    }).listen(default_port); 
});

console.log('Server running on default port');

