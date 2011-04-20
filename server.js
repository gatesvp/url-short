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

function NotFound(path) {
  this.name = 'NotFound';
  if(path){
    Error.call(this, 'Cannot find ' + path);
    this.path = path;
  }
  else{
    Error.call(this, 'Not Found');
  }
  Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

db.open(function(err, db) { 
  var app = express.createServer();

  app.use(app.router);
  app.use(function(req,res,next){
    next(new NotFound(req.url));
  });
  app.set('views', __dirname + '/views');

  app.error(function(err, req, res, next) {
//    if (err instanceof NotFound) {
      res.render('404.jade', { status : 404, error: err });
//    }
//    else {
//      next(err);
//    }
  });

  app.error(function(err, req, res){
    res.render('500.jade', { status: 500, error: err });
  });

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
          res.render('index.jade', docs);
          res.end("");
          //db.close();  // DO NOT CLOSE THE CONNECTION
        });
    }); 
  });

  app.get('/404', function(req, res) { throw new NotFound(req.url); } );
  app.get('/500', function(req, res) { next(new Error('keyboard cat!')); } );

  app.listen(default_port); 
});

console.log('Server running on default port');

