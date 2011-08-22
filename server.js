var default_port = process.env.PORT || 8080;
var pub = __dirname + '/public';

/* Configure plug-ins */
var sys = require('sys');
var express = require('express');
var jade = require('jade');
var mongodb = require('mongodb');
var shorten = require('./shorten');

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

app.get('/history/:stub', function(req, res, next) {
  if(req.params.stub){
    mongodb.connect(mongourl, function(err, conn) { 
      conn.collection('shortened', function(err, collection) { 
        collection.findOne({_id: req.params.stub}, function(err, data) {
          res.render('stats', { short: data._id, outurl: data.url });
          conn.close();
        });
      });
    });
  }
});

app.get('/:stub', function(req, res, next) { 
  require('./forwarding').process_url_forward(req, res, next, mongodb, mongourl); 
});

app.get('/', function(req, res, next){
  if(req.query['url']){
    var urlin = shorten.fix_url(req.query['url']);
    if(req.query['type'] === 'json'){
      shorten.shorten_url(req, res, next, mongodb, mongourl, gen, urlin, true);
    }
    else{
      shorten.shorten_url(req, res, next, mongodb, mongourl, gen, urlin, false);
    }
  }
  else{
    res.render('short');
  }
});

app.post('/', function (req, res, next) {
  var urlin = shorten.fix_url(req.body.urlin);
  shorten.shorten_url(req, res, next, mongodb, mongourl, gen, urlin, false);

});

app.listen(default_port); 

