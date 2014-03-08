'use strict';
/*var io = require('socket.io-client');
var ex_socket = new io.connect("http://171.65.102.132:3006");
var myClock;
var currenttime;

ex_socket.on('connect', function() {
	console.log(">>>> Connected!");
	currenttime = new Date();
	//callBlocks(currenttime);
});

ex_socket.on('disconnect', function() {
	console.log('>>> Clock lost');
});

ex_socket.on('postblocks', function(data){
  	socket.emit('/timeline/#postBlocks', data);
});*/

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
				socket.emit('postblocks',  _.toArray(res) );
			}
		});
	}

	// need to add user log on the timeline server-side
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