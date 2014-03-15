// main requestAnimFrame for all the animation
﻿window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 30);
    };
})();

//// for drawing the joystick
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

var touches; // collections of pointers

/////////////////////////////// ARDUINO SETUP 

// LED setup
//var led1; //-90 D
//var led2; //0 R
//var led3; //90 U
//var led4; //180=-180 L
var max_val; // threshold radius of the joystick
var LEDloopON = false;

///////////////////////////// ARDUINO SETUP END

var username = "noname";	// for socket.io
var arduino_socket;					// for socket.io

document.addEventListener("DOMContentLoaded", init);
window.addEventListener('resize', function(event){ // resize when you resize the browser
	resetCanvas();
});

function init() {
    setupCanvas();
    setupD3();
    //setupMotionDetection();
    
    touches = new Collection();
    
    onReady();
}

function onReady() {
////// jQuery for the socket.io
    // username input
        $('input[name=setUsername]').click(function(){
        	if($('input[name=usernameTxt]').val() != ""){
                username = $('input[name=usernameTxt]').val();
                    var msg = {type:'setUsername', user:username};
                    socket.json.send(msg);
                }
            $('#username').slideUp("slow",function(){
                $('#entergame').slideDown("slow");
            });
        });
        
        $('input[name=openButton]').click(function(){
            var msg = {type:'sendvalveopen'};
            //socket.json.send(msg);
        });
        $('input[name=closeButton]').click(function(){
            var msg = {type:'sendvalveclose'};
            //socket.json.send(msg);
        });
    // chats and score postings        
        arduino_socket = new io.connect('http://171.65.102.132:3006');
        var chat = $('#chat');
        var board = $('#board');

        arduino_socket.on('connect', function() {
            console.log("Connected!");
            setupCanvas();
            socket.emit('message', {channel:'realtime'});
        });
        
        arduino_socket.on('arduino-commands', function(message){
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
                
        arduino_socket.on('postscore', function(score){
                board.empty();
                for (var i=0;i<score.length;i++){
                        if(i==0){
                                board.append('<span style="color: #FA6600">'+ score[i][0]+'  :  '+score[i][1]+'</span> <br />');
                        }else{
                                board.append(score[i][0]+'  :  '+score[i][1]+ '<br />');
                        }
                }
                board.fadeOut('fast');
                board.fadeIn('fast');
                board.fadeOut('fast');
                board.fadeIn('fast');
        });

        arduino_socket.on('disconnect', function() {
                console.log('disconnected');
                chat.html("<b>Disconnected!</b>");
        });

        $("input[name=sendBtn]").click(function(){
                var msg = {type:'chat',message:username + " : " + $("input[name=chatTxt]").val()}
                socket.json.send(msg);
                $("input[name=chatTxt]").val("");
        });



/////////////////////////////
// Drawing Joystick functions
/////////////////////////////

////// EventListeners for joystick canvas
    control_canvas.addEventListener('pointerdown', onPointerDown, false);
    control_canvas.addEventListener('pointermove', onPointerMove, false);
    control_canvas.addEventListener('pointerup', onPointerUp, false);
    control_canvas.addEventListener('pointerout', onPointerUp, false);
    // start drawing joystick loop
    requestAnimFrame(joystick_draw);
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
            // send the input to johnny five
            	
        }
    });

    requestAnimFrame(joystick_draw);
    if(LEDloopON) 
    {
        changeLED(1);
    }
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



/////////////////////////////
// Arduino control functions
/////////////////////////////

function changeLED(LEDon) { // on joystick inputs
    if(LEDon)
    {
	var msg = 
	{type:'/arduino/#sendLEDarrow', user:username, led1:joy_arrow.int1, led2:joy_arrow.int2, led3:joy_arrow.int3, led4:joy_arrow.int4};
    	arduino_socket.json.send(msg);
    }
    else
    {
	var msg = 
	{type:'/arduino/#sendvalvetrigger', user:username, led1:0, led2:0, led3:0, led4:0};
    	arduino_socket.json.send(msg);
    }
}



/////////////////////////////
// Canvas setup functions
/////////////////////////////

function setupCanvas() { // called in init
    control_canvas = document.getElementById('controlCanvas');
    c = control_canvas.getContext('2d');
    resetCanvas();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2;
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
