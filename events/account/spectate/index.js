'use strict';

exports.join = function(app, socket){
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.username;
    }

    socket.join('/spectate/');
    socket.broadcast.to('/speactate/').emit('/spectate/#newVisitor', socket.visitor);
  };
};

exports.send = function(app, socket){
  return function(message) {
    socket.broadcast.to('/spectate/').emit('/spectate/#incoming', socket.visitor +" : "+ message);
  };
};
