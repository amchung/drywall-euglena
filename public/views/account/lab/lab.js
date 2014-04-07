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
var arduino_socket;					// for socket.io

var obj_canvas,
obj_c,
cp_canvas = null;

var vid_canvas,
vid_context;

var brown_const=0;

var vid_width = 640;
var vid_height = 480;

var svg_led;

var l = 80,
	n = 4,
	v = 1/4;
	
var n_max = 20;

document.addEventListener("DOMContentLoaded", init);

window.addEventListener('resize', function(event){ // resize when you resize the browser
	resetCanvas();
});

//////////////////////////////

function init() {
	touches = new Collection();
    // chats and score postings        
	arduino_socket = new io.connect('http://171.65.102.132:3006');
	var chat = $('#chat');
	var board = $('#board');

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
	});

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
		arduino_socket.json.send(msg);
	}
    else{
		var msg = 
		{type:'/arduino/#sendLEDarrow', user:username, led1:0, led2:0, led3:0, led4:0};
    	arduino_socket.json.send(msg);
    }
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

function setupCanvas() { // called in init
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
		.attr("width", vid_width)
		.attr("height", vid_height)
		.style("position", "inherit");
	
	/*svg_led = d3.select("#ledArea").append("svg:svg")
		.attr("class", "display-svg")
		.attr("width", 300)
		.attr("height", 300);*/
	svg_led = d3.select("#canvasArea").append("svg:svg")
		.attr("width", vid_width)
		.attr("height", vid_height)
		.style("position", "inherit");
	
	vid_context = vid_canvas.node().getContext("2d");
	
	c.strokeStyle = "#ffffff";
	c.lineWidth = 2;
	
	shape_bg =
	    svg_led.append("svg:rect")
		.attr("width", 300)
		.attr("height", 300)
		.style("fill", "#000000");
	
	shape_stage =
	    svg_led.append("svg:rect")
		.attr("x", 112.5)
		.attr("y", 112.5)
		.attr("width", 75)
		.attr("height", 75)
		.style("fill", "#111111");
    
	g_ledL =
	    svg_led.append("svg:g")
		.attr("transform", "matrix(1 0 0 -1 55 150)");
		    
	    g_ledL.append("svg:polygon")
		.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
	    g_ledL.append("svg:polygon")
		.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");				
	led_L =
	    g_ledL.append("svg:path")
		.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
		.style("fill", "#ffffff")
		.style("opacity", "0");
						
	g_ledR =
	    svg_led.append("svg:g")
		.attr("transform", "matrix(-1 0 0 1 245 150)");
	    g_ledR.append("svg:polygon")
		.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
	    g_ledR.append("svg:polygon")
		.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");					
	led_R =
	    g_ledR.append("svg:path")
		.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
		.style("fill", "#ffffff")
		.style("opacity", "0");
						
	g_ledU =
	    svg_led.append("svg:g")
		.attr("transform", "matrix(0 1 1 0 150 55)");
	    g_ledU.append("svg:polygon")
		.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
	    g_ledU.append("svg:polygon")
		.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");									
	led_U =
	    g_ledU.append("svg:path")
		.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
		.style("fill", "#ffffff")
		.style("opacity", "0");
						
	g_ledD = svg_led.append("svg:g")
		    .attr("transform", "matrix(0 -1 -1 0 150 245)");
	    g_ledD.append("svg:polygon")
		    .attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
	    g_ledD.append("svg:polygon")
		    .attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");	
	led_D = g_ledD.append("svg:path")
		    .attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
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


function drawObjects(){
	led_U.style("opacity",arrow.int1);
	led_L.style("opacity",arrow.int2);
	led_D.style("opacity",arrow.int3);
	led_R.style("opacity",arrow.int4);
}

function getVideo(){
	getVidFrame("http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime(), function(image) {
		vid_context.clearRect(0, 0, vid_width, vid_height);
		vid_context.drawImage(image, 0, 0, vid_width, vid_height);
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
