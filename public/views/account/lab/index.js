/* global app:true, io:false */
var socket;
var myname;
var clock_socket;
var currenttime;

//////////////////////////////////// for the joystick
var control_canvas,
	c, // context 2D
	halfWidth,
	halfHeight,
	rect_joy,
	leftPointerID = -1,	// variable for mouse left button cursor interactions
	leftPointerPos = new Vector2(0, 0),
	leftPointerStartPos = new Vector2(0, 0),
	leftVector = new Vector2(0, 0);
	arrow = new VectorLED(0, 0, 0, 0);	// vector for LED direction
	joy_arrow = new VectorLED(0, 0, 0, 0);	// vector used for direction calculations
	
var last = 0,
    t = .5;

var touches; // collections of pointers

var username = "noname";			// for socket.io
var arduino_socket;				// for socket.io

var obj_canvas,
obj_c,
cp_canvas = null;

var vid_canvas,
vid_context;

var brown_const=0;

var vid_width = 640;
var vid_height = 480;

var svg, g, svg_led;

var l = 80,
	n = 4,
	v = 1/4;
	
var n_max = 20;

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
	
var 	w = 640,
	h = 480,
	m = 20,
	radius = l/2+10,
	degrees = 180 / Math.PI;

var objects = d3.range(n_max).map(function() {
	var x = 40 + Math.random() * (w-40), y = 40 + Math.random() * (h-40);
	return {
	vx: 0,
	vy: 0,
	path: d3.range(m).map(function() { return [x, y]; }),
	count: 0,
	active: 0,
	size: l,
	color: "#FA6600"
	};
});

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
  	if(str[0]=="5"){
  		window.location.replace("/account/timeline/");
  	}else{
		if(str[0]=="0"){
			clockbar.html("<b><font color='red'>"+data+"</font><b>");	
		}else{
			clockbar.html("<b>"+data+"</b>");
		}
  	}
  });

  clock_socket.on('connect', function() {
	console.log("Arduino-Clock connected!");
	setupCanvas();
	myClock=setInterval(function(){myTimer()},500);
  });
  
  clock_socket.on('client-msg', function(message){
	console.log(message);
		var str = message.split("&&");
		if (Number(str[0]))
		{
			chat.append(str[1] + '<br />');
			console.log(str[1]);
		}else{
			var ledArray = str[1].split("^");
			arrow.int1 = ledArray[0];
			arrow.int2 = ledArray[1];
			arrow.int3 = ledArray[2];
			arrow.int4 = ledArray[3];
		}
  });

  clock_socket.on('disconnect', function() {
	console.log('Clock lost');
  });
  
  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/lab/#access');
  });
  
  socket.on('/lab/#welcome', function(){
  	init();
  });
  
  
  socket.on('/lab/#enterAsSpectator', function(){
  	window.location.replace("/account/spectate/");
  });
    

//document.addEventListener("DOMContentLoaded", init);

/*$(document).ready(function() {
    init();
});*/

window.addEventListener('resize', function(event){ // resize when you resize the browser
	resetCanvas();
});

//////////////////////////////

function init() {
	touches = new Collection();
    // chats and score postings        
	/*arduino_socket = new io.connect('http://171.65.102.132:3006');

	arduino_socket.on('connect', function() {
		console.log("Connected!");
		setupCanvas();
	});
	
	arduino_socket.on('client-msg', function(message){
	console.log(message);
		var str = message.split("&&");
		if (Number(str[0]))
		{
			chat.append(str[1] + '<br />');
			console.log(str[1]);
		}else{
			var ledArray = str[1].split("^");
			arrow.int1 = ledArray[0];
			arrow.int2 = ledArray[1];
			arrow.int3 = ledArray[2];
			arrow.int4 = ledArray[3];
		}
	});

	arduino_socket.on('disconnect', function() {
			console.log('disconnected');
			chat.html("<b>Disconnected!</b>");
	});*/

	$('input[name=triggerButton]').click(function(){
		var msg = {type:'sendvalvetrigger'};
		//socket.json.send(msg);
	});
	
	$('input[name=openButton]').click(function(){
		var msg = {type:'sendvalveopen'};
		//socket.json.send(msg);
	});
	
	$('input[name=closeButton]').click(function(){
		var msg = {type:'sendvalveclose'};
		//socket.json.send(msg);
	});
}

function joystick_draw() {
	c.clearRect(0, 0, control_canvas.width, control_canvas.height);
	    
	c.beginPath();
	c.moveTo(halfWidth, halfHeight-4);
	c.strokeStyle = "rgba(250, 102, 0, 1)";
	c.lineWidth = 2;
	c.lineTo(halfWidth, halfHeight+4);
	c.stroke();
		
	c.beginPath();
	c.moveTo(halfWidth+4, halfHeight);
	c.strokeStyle = "rgba(250, 102, 0, 1)";
	c.lineWidth = 2;
	c.lineTo(halfWidth-4, halfHeight);
	c.stroke();
	
	drawCircles(halfWidth, halfHeight);
	
	//// mouse event loop
	touches.forEach(function (touch) {
	    if (touch.identifier == leftPointerID) {
			    // draw the joystick in the control canvas
		var alpha = arrow.trimArrow(leftVector, max_val);
		
		c.beginPath();
		c.fillStyle = "rgba(250, 102, 0, 1)";
		c.arc(leftPointerPos.x, leftPointerPos.y, 16, 0, Math.PI * 2, true);
		c.fill();
		
		c.beginPath();
		c.moveTo(leftPointerStartPos.x,leftPointerStartPos.y);
		c.strokeStyle = "rgba(250, 102, 0, 1)";
		c.lineTo(leftPointerStartPos.x+max_val*(arrow.int2-arrow.int4),leftPointerStartPos.y+max_val*(arrow.int1-arrow.int3));
		c.lineWidth = 3;
		c.stroke();
			    
		c.beginPath();
		c.fillStyle = "rgba(255, 255, 255, "+alpha+")";
		c.arc(halfWidth, halfHeight, 16, 0, Math.PI * 2, true);
		c.fill();
			    
		c.beginPath();
		c.fillStyle = "#fff"; 
		c.fillText(alpha,halfWidth-10, halfHeight-25);
		    
		c.beginPath();
		c.fillStyle = "#dd6600";
		var theta = leftVector.angle();
		c.fillText(theta.toFixed(0),leftPointerPos.x+10, leftPointerPos.y-20);
	    }
	});
	
	if(LEDloopON) { changeLED(1); }
}



/////////////////////////////
// Mouse event functions
/////////////////////////////

function givePointerType(event) {
    switch (event.pointerType) {
        case event.POINTER_TYPE_MOUSE:
            return "MOUSE";
            break;
        case event.POINTER_TYPE_PEN:
            return "PEN";
            break;
        case event.POINTER_TYPE_TOUCH:
            return "TOUCH";
            break;
    }
}

function onPointerDown(e) {
    var newPointer = { identifier: e.pointerId, x: e.clientX, y: e.clientY, type: givePointerType(e) };
    leftPointerID = e.pointerId;
    leftPointerStartPos.reset(halfWidth, halfHeight);
    leftPointerPos.copyFrom(leftPointerStartPos);
    leftVector.reset(0, 0);
    joy_arrow.reset(0, 0, 0, 0);
    touches.add(e.pointerId, newPointer);
}

function onPointerMove(e) {
    if (leftPointerID == e.pointerId) {
        leftPointerPos.reset(e.pageX-rect_joy.left, e.pageY-rect_joy.top);
        leftVector.copyFrom(leftPointerPos);
        leftVector.minusEq(leftPointerStartPos);
        joy_arrow.setArrow(leftVector, max_val);
        LEDloopON = true;
    }
    else {
        if (touches.item(e.pointerId)) {
            touches.item(e.pointerId).x = e.clientX;
            touches.item(e.pointerId).y = e.clientY;
        }
    }
}

function onPointerUp(e) {
    if (leftPointerID == e.pointerId) {
        leftPointerID = -1;
        leftVector.reset(0, 0);
    }
    leftVector.reset(0, 0);
    joy_arrow.reset(0, 0, 0, 0);
    touches.remove(e.pointerId);
    LEDloopON = false; // we are no longer monitoring the mouse input
    changeLED(0); // turn off all LEDs
}



/////////////////////////////// ARDUINO SETUP 

// LED setup
//var led1; //-90 D
//var led2; //0 R
//var led3; //90 U
//var led4; //180=-180 L
var max_val; // threshold radius of the joystick
var LEDloopON = false;

///////////////////////////// ARDUINO SETUP END


/////////////////////////////
// Arduino control functions
/////////////////////////////

function changeLED(LEDon) { // on joystick inputs
    if(LEDon){
		var msg = 
		{type:'/arduino/#sendLEDarrow', user:username, led1:joy_arrow.int1, led2:joy_arrow.int2, led3:joy_arrow.int3, led4:joy_arrow.int4};
		clock_socket.json.send(msg);
		var obj = "0"+"="+msg.led1+"^"+"1"+"="+msg.led2+"^"+"2"+"="+msg.led3+"^"+"3"+"="+msg.led3;
		socket.emit('/lab/#broadcast',obj);
	}
    else{
		var msg = 
		{type:'/arduino/#sendLEDarrow', user:username, led1:0, led2:0, led3:0, led4:0};
		clock_socket.json.send(msg);
		var obj = "0"+"="+msg.led1+"^"+"1"+"="+msg.led2+"^"+"2"+"="+msg.led3+"^"+"3"+"="+msg.led3;
		socket.emit('/lab/#broadcast',obj);
    }
}



/////////////////////////////
// Canvas setup functions
/////////////////////////////

function setupCanvas() { // called in init
	console.log("setupCanvas");
	control_canvas = document.getElementById('controlCanvas');
	c = control_canvas.getContext('2d');
	
	////// EventListeners for joystick canvas
	control_canvas.addEventListener('pointerdown', onPointerDown, false);
	control_canvas.addEventListener('pointermove', onPointerMove, false);
	control_canvas.addEventListener('pointerup', onPointerUp, false);
	control_canvas.addEventListener('pointerout', onPointerUp, false);
	
	resetCanvas();
	
	//vid_canvas = document.getElementById('display-canvas');
	
	vid_canvas = d3.select("#canvasArea").append("canvas")
		.attr("class", "display-canvas")
		.attr("width", vid_width+40)
		.attr("height", vid_height+40)
		.style("position", "absolute")
		.style("top", 0)
		.style("left", 0);
	
	svg_led = d3.select("#canvasArea").append("svg:svg")
		.attr("width", vid_width+40)
		.attr("height", vid_height+40)
		.style("position", "absolute")
		.style("top", 0)
		.style("left", 0);
	
	vid_context = vid_canvas.node().getContext("2d");
	
	c.strokeStyle = "#ffffff";
	c.lineWidth = 2;
	
    
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
		    
	svg = d3.select("#canvasArea").append("svg:svg")
		.attr("class", "display-svg")
		.attr("width", vid_width)
		.attr("height", vid_height);
	
	g = svg.selectAll("g")
		.data(objects)
		.enter().append("svg:g");

	var box = g.append("svg:rect");
	
	window.setInterval(getVideo, 1000/10);
	
	d3.timer(function(){
		joystick_draw();
		drawObjects();
	});
}

function resetCanvas(e) { // on resize events
    max_val = (document.getElementById("joystickArea").offsetWidth-100)/2;
    console.log('max_val :' + max_val);
    
    // resize the canvas - this clears the canvas
    control_canvas.width = document.getElementById("joystickArea").offsetWidth-20;
    control_canvas.height = control_canvas.width;
    halfWidth = (control_canvas.width)/2;
    halfHeight = (control_canvas.height)/2;
    
    rect_joy = control_canvas.getBoundingClientRect();

    // make sure we scroll to the top left. 
    window.scrollTo(0, 0);
}

function drawObjects(){
	led_U.style("opacity",arrow.int1);
	led_L.style("opacity",arrow.int2);
	led_D.style("opacity",arrow.int3);
	led_R.style("opacity",arrow.int4);
}

function getVideo(){
	getVidFrame("http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime(), function(image) {
		vid_context.clearRect(20, 20, vid_width+20, vid_height+20);
		vid_context.drawImage(image, 20, 20, vid_width, vid_height);
	});
}

function getVidFrame(path, callback) {
	var image = new Image;
	image.src = path;
	image.onload = function() {
		callback(image);
	    //console.log(new Date().getTime());
	};
}

}());
