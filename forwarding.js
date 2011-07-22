module.exports.process_url_forward = function (req, res, next, mongodb1, mongourl1) {
  mongodb1.connect(mongourl1, function(err, conn) { 
    if(!req.params.stub){
      res.render('404', { status: 404, error: null });
    }
    else{
      conn.collection('shortened', function(err, collection) { 
        collection.findOne({_id: req.params.stub}, function(err, data) {
          if(data){
            var addToSet = { };
            var incData = { };
            var ts = new Date();
            var month_string = (ts.getMonth() >= 9) ? (ts.getMonth()+1).toString() : ('0' + (ts.getMonth()+1).toString());
            var day_string = (ts.getDate().toString() > 9) ? ts.getDate().toString() : ('0' + ts.getDate().toString());
            var date_string = ts.getFullYear().toString() + month_string + day_string;
            var query_id = data._id + '_' + date_string;
            var ip_time = 'ip.'+ts.getTime().toString();
            var ref = req.headers.referrer;
            var ip = req.connection.remoteAddress;

            incData['hours.'+(ts.getHours().toString())] = 1;
            incData['minutes.'+(ts.getHours()*60+ts.getMinutes())] = 1;
            addToSet['refs'] = ref;
            addToSet['ip'] = ip;

            conn.collection('shortened_views', function(err, collection) { 
              if(err) { throw err; }
              collection.update({'_id' : query_id}, {$addToSet : addToSet, $inc : incData}, {upsert:true}, function(err, doc){
                if(err) { throw err; }
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
}

