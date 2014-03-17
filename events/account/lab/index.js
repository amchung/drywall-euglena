'use strict';

exports.labaccess = function(app, socket){
  return function() {
   	console.log("////////////enter lab//////////////");
   	socket.visitor = 'guest';
    if (socket.handshake.user) {
      //socket.visitor = socket.handshake.user.username;
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    	console.log(socket.username);
    }
    var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
    
    client.get("global:current:tb_id", function(err,res){
		if (err){
			console.log("error: "+err);
		}else{
		console.log("current block:" +res);
		}
	});
  };
};

