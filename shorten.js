module.exports.shorten_url = function(req, res, next, mongodb, mongourl, gen, urlin, json){
  mongodb.connect(mongourl, function(err, conn) { 
    shorten(req, res, next, conn, urlin, gen, json);    
  });
}

shorten = function(req, res, next, conn, urlin, gen, json){
  // validate it's an actual url
  var url_valid = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  if (!url_valid.test(urlin)){
    res.render('short', {message: "Invalid URL: "+urlin});
  }
  else{
    conn.collection('shortened', function(err, coll){
      if(coll){
        new_id = gen.get_next();
        coll.insert( { '_id' : new_id, 'url' : urlin, 'ts' : new Date().getTime() } );

        outurl = 'http://gvp.no.de/'+new_id;

        if(json) {
          res.json( { 'outurl': outurl } );
        }
        else {
          res.render('compressed', { 'inurl' : urlin, 'outurl' : outurl });
        }
      }
      else{
        console.log('collection is null');
        console.log(err);
      }
    });
  }
}

module.exports.fix_url = function(urlin){
  var urlin = urlin.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
  if(urlin.substring(0,4) != 'http'){
    urlin = 'http://' + urlin;
  }
  return urlin
}


