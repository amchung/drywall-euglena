'use strict';

exports.join = function(app, socket){
  return function() {
  	console.log("////////////join//////////////");
    socket.visitor = 'guest';
    if (socket.handshake.user) {
      socket.visitor = socket.handshake.user.id;
      socket.username = socket.handshake.user.username;
    }
    socket.emit('/pattern/#newUser', socket.username);
  };
};

exports.savepattern = function(app, socket){
  return function(message) {
  	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
  	// convert dates and get block ids
    console.log("Block "+ message.targetBlock + " : set pattern");
    var target_id = message.targetBlock;
    var target_exp_id;
    var target_pattern_id;
    			
    client.get("global:next_pattern_id", function(err,res){
	    if (err){
		    console.log("error: "+err);
	    }else{
		    target_pattern_id = res;
		    console.log("current next_pattern_id: "+target_pattern_id);
		    client.set("pattern_id:"+target_pattern_id+":pattern", message.pattern, function(err){
			if (err){
			    console.log("error: "+err);
			}else{
			    client.incr("global:next_pattern_id");
			    client.set("pattern_id:"+target_pattern_id+":creator", socket.username, function(err){
			      if (err){
				  console.log("error: "+err);
			      }else{
				  client.zadd("pattern_id:"+target_pattern_id+":tag_id", new Date().getTime(), message.tag_id, function(err){
				      if (err) {
					  console.log("error: "+err);
				      }else{
					  client.zadd("user_id:"+message.user_id+":pattern_id", new Date().getTime(), target_pattern_id, function(err){
					      if (err) {
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

exports.settag = function(app, socket){
  return function(message) {
  	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
  	// convert dates and get block ids
    console.log("Block "+ message.targetBlock + " : set tags");
    var target_id = message.targetBlock;
    var target_tag_id;
    
    client.get("global:next_tag_id", function(err,res){
	if (err){
		console.log("error: "+err);
	}else{
		target_tag_id = res;
		console.log("current next_tag_id: "+target_tag_id);
		client.set("tag_id:"+target_tag_id+":tag_text",message.tag_text, function(err){
		  if (err){
		      console.log("error: "+err);
		  }else{
		      client.set("tag_text:"+message.tag_text+":tag_id",target_tag_id, function(err){
			if (err) {
			  console.log("error: "+err)
			}else{
			    client.zadd("tag_id:"+target_tag_id+":pattern_id", new Date().getTime(), message.pattern_id, function(err){
			    if (err){
			      console.log("error: "+err);
			    }else{
			      client.zadd("tag_id:"+target_tag_id+":tb_id", new Date().getTime(), message.tb_id, function(err){
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

exports.loadpattern = function(app,socket){
  return function(message){
    var redis = require("redis"),
	client = redis.createClient();
    var _ = require("underscore");
  }
}

exports.listblocks = function(app,socket){
  return function(message){
    var redis = require("redis"),
	client = redis.createClient();
    var _ = require("underscore");
    
    client.zrange("user_id:"+socket.visitor+":tb_id",0,-1, function(err,res){
	socket.emit('/pattern/#postblocks',  _.toArray(res) );
    });
  }
}

exports.listpatterns = function(app,socket){
  return function(message){
    var redis = require("redis"),
	client = redis.createClient();
    var _ = require("underscore");
  }
}

exports.setpattern = function(app, socket){
  return function(message) {
  	var redis = require("redis"),
	 client = redis.createClient();
	var _ = require('underscore');
	
  	// convert dates and get block ids
    console.log(message.targettime + " : " + socket.username+" : set pattern for exp");
    var target_id;
    var target_exp_id;
    var target_pattern_id = message.target_pattern_id;
    
    client.get("tb_time:"+message.targettime+":tb_id", function(err,res){
      if (err){
	console.log("error: "+err);
      }else{
	target_id = res;
	console.log('>>>> '+ socket.username +' : '+target_id);
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
		client.set("tb_id:"+target_id+":pattern_id",target_pattern_id, function(err) {
		  if (err) {
		    console.error("error");
		  } else {
		    client.zadd("pattern_id:"+target_pattern_id+":exp_id", new Date().getTime(), target_exp_id, function(err,value){
		      client.get("tb_id:"+target_id+":pattern_id", function(err, value) {
			if (err) {
			  console.error("error");
			} else {
			  console.log(">>>> >> block "+target_id+" pattern_id : "+ value);
			  socket.emit('/timeline/#mayenter');
			}
		      });  
		    });
		  }
		});
	      }
	    });
	  }
	});
      }
    });
  };
};


/*exports.setpattern = function(app, socket){
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
								client.set("pattern_id:"+target_pattern_id+":pattern", message.pattern, function(err){
								    if (err){
									    console.log("error: "+err);
								    }else{
									    client.set("pattern_id:"+target_pattern_id+":creator", message.creator, function(err){
										if (err){
										    console.log("error: "+err);
										}else{
										    client.zadd("pattern_id:"+target_pattern_id+":tag_id", new Date().getTime(), message.tag_id, function(err){
											if (err) {
											    console.log("error: "+err);
											}else{
											    client.zadd("user_id:"+message.user_id+":pattern_id", new Date().getTime(), target_pattern_id, function(err){
											        if (err) {
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
				});
			}
		});
	}
    });
  }
};*/

