var default_port = process.env.PORT;
//var default_port = 8080;
var pub = __dirname + '/public';
var root_folder = '/home/node/';
var mongodb_lib = root_folder + 'node-mongodb-native/lib/mongodb';

require.paths.unshift(root_folder + 'express/support');

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

db.open(function(err, conn) { 
  /* Import and initialize hash generator */
  var gen = require('./hash_gen.js').hash_gen(conn);

  /* Configure application */
  var app = express.createServer();

  app.set('view engine', 'jade');

  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(pub));
  app.use('/', express.errorHandler({ dump: true, stack: true }));

record_url_view = function (req, conn, url_obj) {
  // get IP address and ts and query object
  var inData = { };
  inData.ip = req.connection.remoteAddress;
  inData.ts = parseInt(new Date().valueOf());
  inData.url = url_obj.url;

  conn.collection('url_views', function(err, collection) { 
    collection.insert(inData);
  });
}

  app.get('/', function (req, res, next) {
    res.render('short', {} );
  });

  app.get('/:stub', function (req, res, next) {
    if(!req.params.stub){
      res.writeHead(200, {'Content-Type' : 'text/plain'});
      res.write("Not found");
      res.end();
    }
    else{
      conn.collection('shortened', function(err, collection) { 
        collection.findOne({_id : req.params.stub}, function(err, data) {
          if(data){
            record_url_view(req, conn, url);
            res.redirect(data.url);
          }
          else {
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            res.write('HASH NOT FOUND');
            res.end();
          }
        });
      });
    } 
  });

  app.post('/', function (req, res, next) {

    urlin = req.body.urlin;

    // validate it's an actual url
    conn.collection('shortened', function(err, collection){
      new_id = gen.get_next();
      collection.insert( { '_id' : new_id, 'url' : urlin, 'ts' : new Date().getTime() } );

      outurl = 'http://gvp.no.de/'+new_id;

      res.render('compressed', { 'inurl' : req.body.urlin, 'outurl' : outurl });
    });
  });

  app.listen(default_port); 
});

/*

    collection.find({}, {limit:5, sort:[ ['ts','desc'] ] }).toArray( function(err, docs) {
      res.render('index', {locals: {'docs':docs} });
    });
*/
