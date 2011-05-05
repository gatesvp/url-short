var default_port = process.env.PORT || 8080;
var pub = __dirname + '/public';
var root_folder = process.env.HOME;
var mongodb_lib = root_folder + '/node-mongodb-native/lib/mongodb';
require.paths.unshift(root_folder + '/express/support');

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

  app.use(express.favicon((pub+'/favicon.ico')));
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(pub));
  app.use('/', express.errorHandler({ dump: true, stack: true }));

  app.get('/paste/', function(req, res, next) {
    res.render('paste', {});
  });

  app.get('/', function (req, res, next) {
    res.render('short', {} );
  });

  app.get('/:stub', function (req, res, next) {
    if(!req.params.stub){
      res.render('404', { status: 404, error: null });
    }
    else{
      conn.collection('shortened', function(err, collection) { 
        collection.findOne({_id: req.params.stub}, function(err, data) {
          if(data){
            var setData = { };
            var incData = { };
            var ts = new Date();
            var date_string = ts.getFullYear().toString() + (ts.getMonth()+1).toString() + ts.getDate().toString();
            var query_id = data._id + '_' + date_string;
            var ip_time = 'ip.'+ts.getTime().toString();
            setData[ip_time] = req.connection.remoteAddress;
            setData.url = data.url;
            incData['hours.'+(ts.getHours().toString())] = 1;

            conn.collection('shortened_views', function(err, collection) { 
              if(err) { throw err; }
              collection.update({'_id' : query_id}, {$set : setData, $inc : incData}, {upsert:true}, function(err, doc){
                if(err) { throw err; }
                res.write("Redirecting...");
                res.redirect(data.url);
              });
            });
          }
          else {
            res.render('404', { status: 404, error: { path: req.params.stub } } );
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


