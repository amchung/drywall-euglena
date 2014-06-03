/* global app:true, io:false */

var socket;
var myname;


(function() {
  'use strict';

  socket = io.connect();
  socket.on('connect', function(){
	console.log(">> emit join");
  	socket.emit('/spectate/#join');
	setupD3();
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
  
  socket.on('/spectate/#update', function (message) {
    drawObjects(message);
  });
  
  socket.on('disconnect', function() {
    var txt = '>>> disconnected from the server';
    var div = document.getElementById('chat_display');
    div.innerHTML = div.innerHTML + "<br />" +txt;
    div.scrollTop = div.scrollHeight;
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
    //setupD3();
  //}


  function setupD3() {
    canvas = d3.select("#canvasArea").append("canvas")
        .attr("width", vid_width)
        .attr("height", vid_height);
	
    svg_led = d3.select("#canvasArea").append("svg:svg")
		.attr("width", vid_width+40)
		.attr("height", vid_height+40)
		.style("position", "absolute")
		.style("top", 0)
		.style("left", 0);

    led_L = svg_led.append("svg:g").
		append("svg:polygon")
		.attr("points", "26,230 66,260 26,290")
		.style("fill", "#ffffff")
		.style("opacity", "0");
	
    led_R = svg_led.append("svg:g")
		.append("svg:polygon")
		.attr("points", "654,230 654,290 614,260")
		.style("fill", "#ffffff")
		.style("opacity", "0");
						
    led_U = svg_led.append("svg:g")
		.append("svg:polygon")
		.attr("points", "310,26 370,26 340,66")
		.style("fill", "#ffffff")
		.style("opacity", "0");
						
    led_D = svg_led.append("svg:g")
		.append("svg:polygon")
		.attr("points", "310,494 340,454 370,494")
		.style("fill", "#ffffff")
		.style("opacity", "0");
		    
    /*svg = d3.select("#canvasArea").append("svg:svg")
		.attr("class", "display-svg")
		.attr("width", vid_width)
		.attr("height", vid_height);
	
    g = svg.selectAll("g")
		.data(objects)
		.enter().append("svg:g");

    var box = g.append("svg:rect");*/

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

function drawObjects(msg){
  var data = msg.split("^");
  led_U.style("opacity",data[0].split("=")[1]);
  led_L.style("opacity",data[1].split("=")[1]);
  led_D.style("opacity",data[2].split("=")[1]);
  led_R.style("opacity",data[3].split("=")[1]);
}

/////////////////////////////
// Canvas setup functions
/////////////////////////////

var 	shape_bg,
	shape_stage,
	g_ledL,
	g_ledR,
	g_ledU,
	g_ledD,
	led_L,
	led_R,
	led_U,
	led_D;
	
var svg_led;