module.exports.shorten_url = function(req, res, next, mongodb, mongourl){
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
}
