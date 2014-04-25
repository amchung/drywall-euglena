'use strict';

exports.join = function(app, socket){
  return function() {
  	console.log("////////////join//////////////");
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      //socket.visitor = socket.handshake.user.username;
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    }
    socket.emit('/pattern/#newUser', socket.username);
  };
};

exports.setpattern = function(app, socket){
  return function(message) {
  	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
  	// convert dates and get block ids
    console.log("Block "+ message.targetBlock + " : set pattern");
    var target_id = message.targetBlock;
    var target_exp_id;
    var target_pattern_id;
    
    client.get("global:next_exp_id", function(err,res){
	if (err){
		console.log("error: "+err);
	}else{
		target_exp_id = res;
		console.log("current next_exp_id: "+target_exp_id);
		client.set("tb_id:"+target_id+":exp_id",target_exp_id, function(err){
			if (err){
				console.log("error: "+err);
			}else{
				client.incr("global:next_exp_id");			
				client.get("global:next_pattern_id", function(err,res){
					if (err){
						console.log("error: "+err);
					}else{
						target_pattern_id = res;
						console.log("current next_pattern_id: "+target_pattern_id);
						client.set("tb_id:"+target_id+":pattern_id",target_pattern_id, function(err){
							if (err){
								console.log("error: "+err);
							}else{
								client.incr("global:next_pattern_id");
								client.set("pattern_id:"+target_pattern_id, message.pattern, function(err){
								    if (err){
									    console.log("error: "+err);
								    }else{
									    socket.emit('/pattern/#patternsaved',"pattern saved as pattern # "+target_pattern_id + " for block # " + target_id);
								    }
								});
							}
						});
					}
				});
			}
		});
	}
    });
  }
};
