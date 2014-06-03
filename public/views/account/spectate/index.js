/* global app:true, io:false */

var socket;
var myname;


(function() {
  'use strict';

  socket = io.connect();
  socket.on('connect', function(){
	console.log(">> emit join");
  	socket.emit('/spectate/#join');
  });
  
  socket.on('/spectate/#newUser', function(user) {
    var txt = '>>> '+ user +' entered the room !';
    var div = document.getElementById('chat_display');
    div.innerHTML = div.innerHTML + "<br />" +txt;
    div.scrollTop = div.scrollHeight;
  });
  
  socket.on('/spectate/#incoming', function (message) {
    var txt = message;
    var div = document.getElementById('chat_display');
    div.innerHTML = div.innerHTML + "<br />" +txt;
    div.scrollTop = div.scrollHeight;
  });
  
  socket.on('disconnect', function() {
	console.log('>>> timeline disconnected');
  });
  
  
  
  var obj_canvas,
    obj_c,
    cp_canvas = null;

  var canvas
  var video_canvas,
  vid_c;

  var brown_const=0;

  var vid_width = 640;
  var vid_height = 480;

  var svg_led;
  var context;

  var l = 80,
	n = 4,
	v = 1/4;
	
  var n_max = 20;

  var arrow = new VectorLED(0, 0, 0, 0);	// vector for LED direction

  var touches; // collections of pointers

  var LEDloopON = false;

  //document.addEventListener("DOMContentLoaded", init);


  //function init() {
    setupD3();
  //}


  function setupD3() {
    canvas = d3.select("#canvasArea").append("canvas")
        .attr("width", vid_width)
        .attr("height", vid_height);

    context = canvas.node().getContext("2d");  

	d3.timer(function() {
  		//drawObjects();
	});

	setInterval(getVideo, 1000/20);
		
	function getVideo(){
	    getVidFrame("http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime(), function(image) {
	        context.clearRect(0, 0, vid_width, vid_height);
	        context.drawImage(image, 0, 0, vid_width, vid_height);
	    });
        
	    function getVidFrame(path, callback) {
	        var image = new Image;
	        image.src = path;
	        image.onload = function() {
	            callback(image);
				//console.log(new Date().getTime());
	        };
	    }
	}
  }
  
  $('#chatTxt').keydown(function(e){
    if (e.which == 13) {
      var text = document.getElementById('chatTxt').value;
      document.getElementById('chatTxt').value = "";
      console.log(text);
      socket.emit('/spectate/#send',{ user:myname, msg: text });
      
    }
  });

}());
