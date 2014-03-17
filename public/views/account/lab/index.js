/* global app:true, io:false */
var socket;
var myname;
var clock_socket;
var currenttime;

(function() {
  'use strict';

 var clockbar = $('#clock_bar');
  var myClock;
  function myTimer(){
		// >>>>>> socket: look clock
		clock_socket.emit('lookclock');
  }
  clock_socket = io.connect('http://171.65.102.132:3006');
  
  clock_socket.on('server_clock', function(data){
  	var str = data.split(":");
  	if(str[0]=="0"){
  		clockbar.html("<b><font color='red'>"+data+"</font><b>");
  	}
  	else{
  		clockbar.html("<b>"+data+"</b>");
  	}
  });

  clock_socket.on('connect', function() {
	console.log("Clock connected!");
	myClock=setInterval(function(){myTimer()},500);
  });

  clock_socket.on('disconnect', function() {
	console.log('Clock lost');
  });
  
  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/lab/#access');
  });
    
}());
