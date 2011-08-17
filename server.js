var default_port = process.env.PORT || 8080;
var pub = __dirname + '/public';

require.paths.unshift('./node_modules');

/* Configure plug-ins */
var sys = require('sys');
var express = require('express');
var jade = require('jade');
var mongodb = require('mongodb');

/* Configure DB connections */
var mongourl = require('./mongo_utils').generate_mongo_url();

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

app.get('/:stub', function(req, res, next) { 
  require('./forwarding').process_url_forward(req, res, next, mongodb, mongourl); 
});

app.get('/', function(req, res, next){
  if(req.query['url']){
    var urlin = require('./shorten').fix_url(req.query['url']);
    require('./shorten').shorten_url(req, res, next, mongodb, mongourl, gen, urlin);
  }
  else{
    res.render('short');
  }
});

app.post('/', function (req, res, next) {

  /* Trim URL, prepend HTTP if necessary */
  var urlin = require('./shorten').fix_url(req.body.urlin);
  require('./shorten').shorten_url(req, res, next, mongodb, mongourl, gen, urlin);

});

app.listen(default_port); 

