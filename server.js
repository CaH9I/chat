var express = require('express');
var app = express();

app.use(express.static('./public'));
var server = app.listen(3000, function() {
  console.log('Server listening on port 3000.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);