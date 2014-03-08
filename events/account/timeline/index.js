'use strict';
var test='test string';

exports.join = function(app, socket){
	console.log("////////////join//////////////");
	console.log(test);
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      //socket.visitor = socket.handshake.user.username;
      socket.visitor = socket.handshake.user;
    }

    socket.join('/account/timeline/');
    socket.broadcast.to('/account/timeline/').emit('/timeline/#newUser', socket.visitor);
  };
};

exports.callblocks = function(app, socket){
  return function(message) {
    socket.broadcast.to('/account/timeline/').emit('/timeline/#postBlock', socket.visitor, message);
  };
};

/*exports.reserve = function(app, socket){
  return function(message) {
    socket.broadcast.to('/account/timeline').emit('/timeline/#incoming', socket.visitor, message);
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