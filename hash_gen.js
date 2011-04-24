module.exports.hash_gen = function(db){
  var _current_increment = '';
  var _hash_array = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  db.collection('shortened', function(err, collection){
    collection.find({}, {limit:1, sort:[ ['ts','desc'] ] }).toArray( function(err, docs) {
      _current_increment = (docs.length > 0 ? docs[0]._id : 'a');
    });
  });

  debase = function(x){
    var l = _hash_array.length;
    var sum = 0;

    for(i = 0; i < x.length; i++){
      sum += _hash_array.indexOf(x[i]) + (i * l);
    }
    return sum;
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

  return {
    get_next : function(){
      _current_increment = rebase(debase(_current_increment)+1);
      return _current_increment;
    }
  };
};

