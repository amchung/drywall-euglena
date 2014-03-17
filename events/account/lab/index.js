'use strict';

exports.join = function(app, socket){
	console.log("////////////enter lab//////////////");
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      //socket.visitor = socket.handshake.user.username;
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    }
    
    var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
    
    client.get("tb_time:"+begintime+":tb_id", function(err,res){
		if (err){
			console.log("error: "+err);
		}
		firstid = res;
		// if out of range
		if (firstid == null){
			firstid = 0;
			lastid = firstid + (3*60/5);
		}
		console.log("looking up : block # "+firstid);
	}
    
    
    
    socket.emit('/timeline/#newUser', socket.username);
  };
};

