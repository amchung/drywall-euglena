'use strict';

exports.join = function(app, socket){
	console.log("////////////join//////////////");
  return function() {
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      //socket.visitor = socket.handshake.user.username;
      socket.visitor = socket.handshake.user.id;
    }
    socket.emit('/timeline/#newUser', socket.visitor);
  };
};

exports.callblocks = function(app, socket){
  return function(message) {
	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	 
	// get max limit
	var timeline_end;
	client.get('global:next_tb_id', function(err,res){
		if (err){
			console.log("error: "+err);
		}
			timeline_end =res;
			getblockIDs();
	});
	
	// convert dates and get block ids
	var beginT = new Date(message.begintime);
    var endT = new Date(message.endtime);
	var begintime = beginT.getTime();
	var endtime = endT.getTime();
	
	var firstid;
	var lastid;
	var commands = [];
	
	function getblockIDs(){
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
		
			client.get("tb_time:"+endtime+":tb_id", function(err,res){
				if (err){
					console.log("error: "+err);
				}
				lastid = res;
				// if out of range
				if (lastid == null)
				{
					lastid = timeline_end;
					firstid = lastid - (3*60/5);
				}
				console.log(" ~  block # " +lastid);
			
				runCommands(firstid, lastid);
			});
		});
	}
	
	function runCommands(firstid, lastid){
		var first = parseInt(firstid);
		var last = parseInt(lastid);
		console.log(first+"~"+last);
		
		for (var i=first;i<=last;i++){
			commands.push(["get","tb_id:"+i+":time"]);
			commands.push(["get","tb_id:"+i+":locked"]);
			commands.push(["get","tb_id:"+i+":user_id"]);
			commands.push(["get","tb_id:"+i+":exp_id"]);
			commands.push(["get","tb_id:"+i+":pattern_id"]);
			commands.push(["get","tb_id:"+i+":past"]);
			commands.push(["get","tb_id:"+i+":admin"]);
			commands.push(["get","tb_id:"+i+":current"]);
			commands.push(["get","tb_id:"+i+":image"]);
		}
		client.multi(commands).exec(function (err, res) {
			if(err){
				console.log("error: "+err);
			}else{
				socket.emit('/timeline/#postblocks',  _.toArray(res) );
			}
		});
	}

	// need to add user log on the timeline server-side
  };
};

exports.reserveblock = function(app, socket){
  return function(message) {
  	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
  	// convert dates and get block ids
    //var targetT = new Date(message.targettime);
    //var targettime = targetT.getTime();
    console.log(message.targettime);
    var target_id;
    
    client.get("tb_time:"+message.targettime+":tb_id", function(err,res){
		if (err){
			console.log("error: "+err);
		}
		target_id = res;
		console.log('>>>> '+ socket.visitor +' : '+target_id);
		
		// lock the block
		var output1 = redis_set("tb_id:"+target_id+":locked",1,"block locked");
		socket.emit('/timeline/#doneRequest', output1);
    	// write down owner user id
		var output2 = redis_set("tb_id:"+target_id+":user_id",socket.visitor,"block locked");
		socket.emit('/timeline/#doneRequest', output2);
		
		//INCR global:next_exp_id
		//SET tb_id:1000:exp_id global:next_exp_id
		//if freeform
			//SET tb_id:1000:pattern_id 0
	});
	
	function redis_set(key,value,output){
		client.set(key,value, function(err) {
			if (err) {
			   console.error("error");
			} else {
				client.get(key, function(err, value) {
					 if (err) {
						 console.error("error");
						 return "error"
					 } else {
						 console.log(">>>> >>"+key+" : "+ value);
						 return output
					 }
				});
			  }
		});
	}
  };
};


/*

// look clock
socket.emit('lookclock');

//call blocks
socket.emit('timeline', { type: 'callblocks', user:username, begintime: beginT, endtime: endT});

//reserve block
socket.emit('timeline', { type: 'reserveblock', user:user.username, begintime: beginT, endtime: endT});*/