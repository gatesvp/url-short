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
var _current_increment = 'a';
var _hash_array = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
get_next_increment = function(curr){
  if(!curr){
    return 'a';
  }
  return rebase(debase(curr)+1)
}
debase = function(x){
  var l = _hash_array.length;
  var sum = 0;

  for(i = 0; i < x.length; i++){
    sum += demod(x[i]) * i * l;
  }
  return sum;
}
demod = function(x){
  return _hash_array.indexOf(x);
}
rebase = function(x){
  l = _hash_array.length;
  var res = _hash_array[x % l];

  while( x / l >= 1){
    x = x/l;
    res += _hash_array[x % l];
  }
  return res;
}

db.open(function(err, db) { 

  increment_hash = function(){
    if(_hash_array == 'a'){
      db.collection('shortened', function(err, collection){
        collection.find({}, {limit:1, sort:[ ['ts','desc'] ] }).toArray( function(err, docs) {
          _current_increment = (docs.length > 0 ? docs[0]._id : 'a');
        });
      });
    }
    _current_increment = get_next_increment(_current_increment);
    return _current_increment;
  }

  var app = express.createServer();

  app.set('view engine', 'jade');

  app.use(express.bodyParser());
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
    res.render('short', { 'inurl' : null, 'outurl' : null });
  });

  app.post('/u', function (req, res, next) {

    urlin = req.body.urlin;

    // validate it's an actual url

    db.collection('shortened', function(err, collection){

      new_id = increment_hash();
      collection.insert( { '_id' : new_id, 'url' : urlin, 'ts' : new Date().getTime() } );

      outurl = 'http://gvp.no.de/'+new_id;

      res.render('short', { 'inurl' : req.body.urlin, 'outurl' : outurl });

    });

  });

  app.listen(default_port); 
});


