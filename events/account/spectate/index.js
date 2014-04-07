'use strict';

exports.showaccess = function(app, socket){
  return function() {
   	console.log("//////////// enter the spectator mode //////////////");
   	socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    	//console.log(socket.username);
    }
	/*if(){
		socket.emit('/lab/#welcome');
	}else{
		console.log(":( kick out the bystander");
		socket.emit('/lab/#kickout');
	}*/
  };
};

