var default_port = process.env.PORT || 8080;
var pub = __dirname + '/public';
var mongo = { "hostname":"localhost", "port":27017, "username":"", "password":"", "name":"", "db":"" };

require.paths.unshift('./node_modules');

/* Configure plug-ins */
var sys = require('sys');
var express = require('express');
var jade = require('jade');
var mongodb = require('mongodb');

/* Configure DB connections */
var mongourl = require('./mongo_utils').generate_mongo_url(mongo);

/* Import and initialize hash generator */
var gen = require('./hash_gen.js').hash_gen(mongourl);

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

app.get('/paste', function(req, res, next) {
  res.render('paste', {});
});

app.get('/', function (req, res, next) {
  res.render('short', {} );
});

app.get('/:stub', function(req, res, next) { 
  require('./forwarding').process_url_forward(req, res, next, mongodb, mongourl); 
});

app.post('/', function (req, res, next) {
  mongodb.connect(mongourl, function(err, conn) { 
    /* Trim URL, prepend HTTP if necessary */
    urlin = req.body.urlin;
    urlin = urlin.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
    if(urlin.substring(0,4) != 'http'){
      urlin = 'http://' + urlin;
    }

    // validate it's an actual url
    var url_valid = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	  if (!url_valid.test(urlin)){
      res.render('short', {message: "Invalid URL: "+urlin});
    }
    else{
      conn.collection('shortened', function(err, collection){
        new_id = gen.get_next();
        collection.insert( { '_id' : new_id, 'url' : urlin, 'ts' : new Date().getTime(), 'arr' : [1,2,3] } );

        outurl = 'http://gvp.no.de/'+new_id;

        res.render('compressed', { 'inurl' : req.body.urlin, 'outurl' : outurl });
      });
    }
  });
});

app.listen(default_port); 

