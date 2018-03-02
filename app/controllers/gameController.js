// Includes
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Routes
var indexRoute = require('../routes/index')(app, express);

// Sockets
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});