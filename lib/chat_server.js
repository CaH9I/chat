var socketio = require('socket.io');
var db = require('./db');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];

exports.listen = function(server) {
  io = socketio.listen(server);
  io.sockets.on('connection', function(socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    handleMessageBroadcasting(socket);
    handleMessageSaving(socket);
    handleNameChanging(socket);
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Àíîíèì' + guestNumber;
  nickNames[socket.id] = name;
  namesUsed.push(name);
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  return guestNumber + 1;
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.emit('message', {
      name: nickNames[socket.id],
      text: message.text
    });
  });
}

function handleMessageSaving(socket) {
  socket.on('message', function(message) {
    db.saveMessage(message.text);
  });
}

function handleNameChanging(socket) {
  socket.on('nameAttempt', function(name) {
    if (name.indexOf('Àíîíèì') === 0) {
      socket.emit('nameResult', {
        success: false,
        cause: 'Íèê íå ìîæåò íà÷èíàòüñÿ ñ "Àíîíèì".'
      });
    } else {
      if (namesUsed.indexOf(name) === -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          cause: 'Ýòîò íèê óæå èñïîëüçóåòñÿ'
        });
      }
    }
  });
}

function handleClientDisconnection(socket, nickNames, namesUsed) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
