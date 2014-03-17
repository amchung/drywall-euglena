'use strict';

exports.join = function(app, socket){
	console.log("////////////enter lab//////////////");
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    }
    
    var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
    
    client.get("global:current:tb_id", function(err,res){
		if (err){
			console.log("error: "+err);
		}else{
		console.log("current block:" res);
		}
	});
  };
};

