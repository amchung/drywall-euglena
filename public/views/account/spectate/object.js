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

function setupD3() {
    canvas = d3.select("#canvasArea").append("canvas")
        .attr("width", vid_width)
        .attr("height", vid_height);
    
    svg_led = d3.select("#canvasArea").append("svg:svg")
        .attr("width", 150)
        .attr("height", 150)
        .attr("viewBox", "40+300 40 220 220")
        .style("opacity", "0.5")
        .attr("transform", "translate(300)");
        
    var shape_bg = svg_led.append("svg:rect")
    							.attr("width", 300)
    							.attr("height", 300)
    							.style("fill","#000000");
        
    var shape_stage = svg_led.append("svg:rect")
    							.attr("x", 112.5)
    							.attr("y", 112.5)
    							.attr("width", 75)
    							.attr("height", 75)
    							.style("fill", "#111111");
    
    var g_ledL = svg_led.append("svg:g")
    						.attr("transform", "matrix(1 0 0 -1 55 150)");
    			g_ledL.append("svg:polygon")
    						.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
    			g_ledL.append("svg:polygon")
    						.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");				
    var led_L = g_ledL.append("svg:path")
    						.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
    						.style("fill", "#ffffff")
    						.style("opacity", "0");
    						
    var g_ledR = svg_led.append("svg:g")
    						.attr("transform", "matrix(-1 0 0 1 245 150)");
    			g_ledR.append("svg:polygon")
    						.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
    			g_ledR.append("svg:polygon")
    						.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");					
    var led_R = g_ledR.append("svg:path")
    						.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
    						.style("fill", "#ffffff")
    						.style("opacity", "0");
    						
    var g_ledU = svg_led.append("svg:g")
    						.attr("transform", "matrix(0 1 1 0 150 55)");
    			g_ledU.append("svg:polygon")
    						.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
    			g_ledU.append("svg:polygon")
    						.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");									
    var led_U = g_ledU.append("svg:path")
    						.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
    						.style("fill", "#ffffff")
    						.style("opacity", "0");
    						
    var g_ledD = svg_led.append("svg:g")
    						.attr("transform", "matrix(0 -1 -1 0 150 245)");
    			g_ledD.append("svg:polygon")
    						.attr("points", "-39.042,8.417 24.708,8.417 24.7,6.191 20.958,5.667 6.708,1.417 6.708,6.167 -39.042,6.167 	");
    			g_ledD.append("svg:polygon")
    						.attr("points", "-38.792,-8.333 21.458,-8.333 24.208,-6.333 24.208,3.667 6.708,-2.333 6.708,-5.833 -38.792,-5.833 	");	
    var led_D = g_ledD.append("svg:path")
    						.attr("d", "M39.042,0.834c0-3.697-0.483-7.667-4.069-10.966c-8.452-7.775-36.53-7.701-38.847-7.701c-3.728,0-4.75,7.909-4.75,17.667c0,9.757,1.022,17.667,4.75,17.667c2.282,0,32.307,0.417,38.792-6.494C38.095,7.62,39.042,4.622,39.042,0.834z")
    						.style("fill", "#ffffff")
    						.style("opacity", "0");
            
    context = canvas.node().getContext("2d");  

	var w = 640,
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

	var svg = d3.select("#canvasArea").append("svg:svg")
    	.attr("width", vid_width)
    	.attr("height", vid_height);
    		
	var g = svg.selectAll("g")
    	.data(objects)
		.enter().append("svg:g");

	var box = g.append("svg:rect");
	
	function drawObjects(){
		for (var i = -1; ++i < n;) {
    		var object = objects[i],
        		x = object.path[0][0],
        		y = object.path[0][1];

    		// stuck at the walls.
    		if (x < 0)
    		{
    			object.path[0][0] = l;
    		}
    		if(x > w-l) 
    		{
    			object.path[0][0] = w-l;
    		}
    		if (y < 0)
    		{
    			object.path[0][1] = l;
    		}
    		if (y > h-l)
    		{
    			object.path[0][1] = h-l;
    		}	
    		object.size = l;
    		object.active = (i<n)?1:0;
    	}
    	box.attr("opacity", function(d,i){
    		return d.active;
    	});
		box.attr("width", function(d,i){
			return d.size;
		});
		box.attr("height", function(d,i){
			return d.size;
		});
		box.attr("stroke", function(d,i){
			return d.color;
		});
  		box.attr("transform", function(d) {
    		return "translate(" + d.path[0] + ")";
  		});
  		
  		led_U.style("opacity",arrow.int1);
  		led_L.style("opacity",arrow.int2);
  		led_D.style("opacity",arrow.int3);
  		led_R.style("opacity",arrow.int4);
  	}


	d3.timer(function() {
  		drawObjects();
	});

	window.setInterval(getVideo, 1000/20);
		
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
