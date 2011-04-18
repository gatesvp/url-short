var default_port = process.env.PORT;

var http = require('http');

http.createServer( function(req, res) { 
  res.writeHead(200, {'Content-Type' : 'text/plain' });
  res.end('Hello World\n');
}).listen(default_port);

console.log('Server running on default port');

