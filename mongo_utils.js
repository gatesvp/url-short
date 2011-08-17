var mongo_default = { "hostname":"localhost", "port":27017, "username":"", "password":"", "name":"", "db":"" };

module.exports.generate_mongo_url = function(obj){
  if(!obj) { obj = mongo_default; }

  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'visits');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db + "?auto_reconnect=true";
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

