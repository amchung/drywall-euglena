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
	
	//window.setInterval(getVideo, 1000/10);
	
	/*d3.timer(function(){
		joystick_draw();
		drawObjects();
	});*/
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
	degrees = 180 / Math.PI;


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
