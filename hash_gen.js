var mongodb = require('mongodb');

module.exports.hash_gen = function(mongourl){
  var _current_increment = '';
  var _current_range = {};
  var _max_num = 0;
  var _hash_array = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  debase = function(x){
    var l = _hash_array.length;
    var sum = 0;

    var i = x.length-1;

    for(j = 0; j < x.length; j++) {
      sum += _hash_array.indexOf(x[j]) * Math.pow(l, i);
      i--;
    }
    return sum;
  }
  rebase = function(x){
    var base = _hash_array.length;
    var res = "";
    
    while(x > 0){
      var r = x % base;
      res = _hash_array[r] + res;
      var d = x / base;
      x = Math.floor(d);
    }
    return res;
  }

  load_range = function(){
    mongodb.connect(mongourl, function(err, conn) { 
      conn.collection('partition', function(err, collection){
        collection.findAndModify({'status':'new'}, [], { $set: { 'status': 'active' } }, { }, function(err, doc) {
          _current_range = doc;
          if(_current_range) { 
            _current_increment = doc.lower; 
            _max_num = debase(doc.upper);
          }
        });
      });
    });
  };

  load_range();

  return {
    get_next : function(){
      var next = debase(_current_increment)+1;
      if(next < _max_num){
        _current_increment = rebase(next);
      }
      else{
        load_range();
      }
      return _current_increment;
    }
  };
};

/* Basic code for generating partitions
 for(i = 1; i < 10000000; i = i+10000){ db.partition.insert({'lower': rebase(i),'upper': rebase(i+10000-1)}); }
*/

