'use strict';

exports.labaccess = function(app, socket){
	console.log("////////////enter lab//////////////");
  return function() {
    console.log(socket.username);
    
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

