'use strict';

exports.join = function(app, socket){
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    }
    
    //socket.emit('/spectate/#newUser', socket.username);

    socket.join('/spectate/');
    socket.broadcast.to('/spectate/').emit('/spectate/#newUser', socket.username);
  };
};

exports.send = function(app, socket){
  return function(message) {
    socket.broadcast.to('/spectate/').emit('/spectate/#incoming', socket.visitor +" : "+ message.msg);
  };
};
