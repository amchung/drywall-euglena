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
	var fs = require('fs');
	
	var targetBlock = message.targetBlock;
	var commands = [];
	
        runCommands(targetBlock);
	
	function runCommands(targetBlock){
	    var block = parseInt(targetBlock);
	    console.log("access block "+block);
	    
	    commands.push(["get","tb_id:"+block+":time"]);
	    commands.push(["get","tb_id:"+block+":username"]);
	    commands.push(["get","tb_id:"+block+":exp_id"]);
	    commands.push(["get","tb_id:"+block+":pattern_id"]);
	    
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
  };
};

exports.callimglist = function(app, socket){
  return function(message) {
	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	var fs = require('fs');
	
	var targetBlock = message.targetBlock;
	 console.log("image list for block "+targetBlock);
	var path = '../../Dropbox/live-gallery/'+targetBlock;
	
	fs.readdir(path, function (err, files) {
	  var imagelist = [];
	  if(err) {
	    socket.emit('/replay/#404_err')
	  }
	  else{
	    files.forEach(function(file) {
	      imagelist.push(file);
	    });
	    socket.emit('/replay/#postimglist',  imagelist );
	  }
	});
  };
};