require.paths.unshift('/home/node/express/support');

var default_port = process.env.PORT;
var pub = __dirname + '/public';
var mongodb_lib = '/home/node/node-mongodb-native/lib/mongodb';

/* Configure plug-ins */
var sys = require('sys');
var express = require('express');
var jade = require('jade');

/* Configure DB connections */
var Db = require(mongodb_lib).Db,
  Connection = require(mongodb_lib).Connection,
  Server = require(mongodb_lib).Server,
  BSON = require(mongodb_lib).BSONNative;

var host = 'localhost';
var port = 27017;
var db = new Db('visits', new Server(host, port, {}));

db.open(function(err, db) { 
  var app = express.createServer();

  app.set('view engine', 'jade');

  app.use(app.router);
  app.use(express.static(pub));
  app.use('/', express.errorHandler({ dump: true, stack: true }));

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
          res.render('index', {locals: {'docs':docs} });
        });
    }); 
  });

  app.get('/u', function (req, res, next) {
    res.render('short', {});
  });

  app.listen(default_port); 
});


