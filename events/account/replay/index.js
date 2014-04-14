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
    socket.emit('/replay/#newUser', socket.username);
  };
};

exports.callblock = function(app, socket){
  return function(message) {
	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
	var targetBlock = message.targetBlock;
	var commands = [];
	
	runCommands(targetBlock);
	
	function runCommands(targetBlock){
		var block = parseInt(targetBlock);
		console.log("access block "+block);
		
		commands.push(["get","tb_id:"+block+":time"]);
		commands.push(["get","tb_id:"+block+":locked"]);
		commands.push(["get","tb_id:"+block+":username"]);
		commands.push(["get","tb_id:"+block+":exp_id"]);
		commands.push(["get","tb_id:"+block+":pattern_id"]);
		commands.push(["get","tb_id:"+block+":image"]);
		commands.push(["zrange", "tb_id:"+block+":arduino-log", 0, -1, "withscores"]);
		//zrange tb_id:12367:arduino-log 0 -1 withscores

		client.multi(commands).exec(function (err, res) {
			if(err){
				console.log("error: "+err);
			}else{
				socket.emit('/replay/#postdata',  _.toArray(res) );
			}
		});
	}

	// need to add user log on the timeline server-side
  };
};