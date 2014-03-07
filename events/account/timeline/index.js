'use strict';

exports.join = function(app, socket){
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.username;
    }

    socket.join('/account/timeline/');
    socket.broadcast.to('/account/timeline').emit('/account/timeline/#newVisitor', socket.visitor);
  };
};

exports.clock = function(app, socket){
	var io = require('socket.io-client');
	var ex_socket = new io.connect("http://171.65.102.132:3006");
	ex_socket.on('connect', function() {
		ex_socket.emit('lookclock');
	});
	ex_socket.on('server_clock', function(data){
  		return function(data) {
    		socket.broadcast.to('/account/timeline').emit('/about/timeline/#show-clock', data);
  	  };
  	});
};

/*exports.blocks-delivery = function(app, socket){
  return function(message) {
    socket.broadcast.to('/account/timeline').emit('/about/timeline/#incoming', socket.visitor, message);
  };
};

exports.reserve = function(app, socket){
  return function(message) {
    socket.broadcast.to('/account/timeline').emit('/about/timeline/#incoming', socket.visitor, message);
  };
};
*/



/*

// look clock
socket.emit('lookclock');

//call blocks
socket.emit('timeline', { type: 'callblocks', user:username, begintime: beginT, endtime: endT});

//reserve block
socket.emit('timeline', { type: 'reserveblock', user:user.username, begintime: beginT, endtime: endT});*/