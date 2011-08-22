var mongodb = require('mongodb');

module.exports.get_item_history = function(req, res, next, mongourl) {
  mongodb.connect(mongourl, function(err, conn) { 
    conn.collection('shortened', function(err, shortened) { 
      shortened.findOne({_id: req.params.stub}, function(err, data) {
        conn.collection('shortened_views', function(err, shortened_views){
          shortened_views.find({_id: { $regex: data._id + '_' } }, {'total':1}, {'sort':[['_id','asc']]}).toArray(function(err, stats){

            // Stats manipulation goes here
            var hourly_stats = generate_hourly_stats(stats);

            res.render('stats', { short: data._id, outurl: data.url, hourly_stats: JSON.stringify(hourly_stats) });
            conn.close();
          });
        });
      });
    });
  });
}

generate_hourly_stats = function(stats){

  var output = []; 

  for(var i in stats){
    date = stats[i]._id.split(/_/)[1];
    value = stats[i].total;
    output.push([date,value]);
  }

  return output;
}
