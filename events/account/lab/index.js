'use strict';

exports.labaccess = function(app, socket){
  return function() {
   	console.log("////////////enter lab//////////////");
   	socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    	//console.log(socket.username);
    }
    var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
    client.get("global:current:tb_id", function(err,res){
    	var current_block;
		if (err){
			console.log("error: "+err);
		}else{
			current_block = res;
			console.log("current block:" + current_block);
			
			client.get("tb_id:"+current_block+":username", function(err,res){
				if (err){
					console.log("error: "+err);
				}else{
					console.log("current block owner:" + res);
					console.log("you are " + socket.username);
					if(res == socket.username){
						console.log("Welcome master!");	
					}else{
						console.log(":( kick out the bystander");
						var Thug = new Backbone.Router();
						Thug.navigate('/account/timeline/', {trigger: true}); 
					}
				}
			});
		}
	});
  };
};

