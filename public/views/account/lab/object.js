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
    
    svg_led = d3.select("#ledArea").append("svg:svg")
        .attr("width", 300)
        .attr("height", 300);
        
    var shape_bg = svg_led.append("svg:rect")
    							.attr("width", 300)
    							.attr("height", 300)
    							.style("fill", "#000000");
        
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
            image.onload = function() {
                callback(image);
				//console.log(new Date().getTime());
                compareFrame(image);
            };
            image.src = path;
        }
    }
    
    
    function compareFrame(img1) {
		// check if there are two pictures
  		if ( img2 != null ) {
    		var res=[0,0,0,0];
    		try {
    			for (var i = -1; ++i < n;){
    				res = compare(img1, img2, objects[i].path[0][0], objects[i].path[0][1], 14, l/2+10); 
    			    	if ((res[0]>400)||(res[1]>400)||(res[2]>400)||(res[3]>400)){
            				res[0]=0;res[1]=0;res[2]=0;res[3]=0;
    					}
    				objects[i].path[0][0]+=(res[0]+res[2]-res[1]-res[3])*v+(Math.random()-0.5)*20*brown_const
    				objects[i].path[0][1]+=(res[0]+res[1]-res[2]-res[3])*v+(Math.random()-0.5)*20*brown_const
					objects[i].color = ((res[0]+res[1]+res[2]+res[3])>0)?"#FDAC0D":"#FA6600";
					console.log(res[0]+res[1]+res[2]+res[3]);
    			}
    		}
    	catch(e) {
    			// errors
    		}
		}
		img2 = img1;
	}

}



function game(){
	switch(gamephase)
	{
		case 'pre-game':
			// draw intro
		break;
		case 'game-rest':
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.fillText('New target ...',200,20);
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
		break;
		case 'game-action':
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.fillText('Run! Run! Run!',200,20);
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
		break;
		case 'gameover':		
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.textAlign="start"; 
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
    		vid_c.fillStyle = "rgba(253,172,13,1)"; 
    		vid_c.font="40pt sans-serif";
    		vid_c.textAlign="center"; 
    		vid_c.fillText('GAME OVER',vid_width/2,vid_height/2-100);
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="20pt sans-serif";
    		vid_c.fillText(username+' scored '+score_val,vid_width/2,vid_height/2);
		break;
		default:
			vid_c.fillStyle = "#fff";
			vid_c.font="14px sans-serif";
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
	}
}

var shipX=vid_width/2,
	shipY=vid_height/2,
	shipRad,
	shipL=20,
	starX=40,
	starY=20;
var gamelevel;
var int_star=-1;
var int_engine=-1;
var engine = false;
var rest = false;
var starTimer;
var enginerTimer;
var gamephase;
var score_val = 0;
var actionTimer;
var unit=30;

function setGameAction(){
	actionTimer = window.requestAnimationFrame(actionLoop);
}

function setbackPreGame(){
    score_val = 0;
    hit = new Array();
    gamelevel=1;
    
	shipX = vid_width/2;
    shipY = vid_height/2;
    
    gamephase='pre-game';
}

function setGameOver(){
  	window.cancelAnimationFrame(actionTimer);
    actionTimer = undefined;
}


function actionLoop(){
	switch(gamephase)
	{
		case 'rest':
  			if(rest==false)
			{
				rest=true;
				int_star=gamelevel+6;
				getStarLocation(); // get new starX, starY, shipRad
				starTimer=window.setInterval(showStar,500);
			}
			drawStar(shipX,shipY,starX,starY,gamelevel-(int_star-6));
			drawShip(shipX,shipY,shipRad);
			actionTimer = window.requestAnimationFrame(gameLoop);
  		break;
		case 'engine':
			console.log(hit);
  			if(hit>0)
			{
				window.clearInterval(engineTimer);
				engine=false;
				rest=false;
				int_star=-1;
				int_engine=-1;
				gamephase='gameover';
				gamelevel=-1;
			}
			else
			{
				score_val=score_val+10;
				if(engine==false)
				{
					engine=true;
					int_engine=gamelevel+4;
					engineTimer=window.setInterval(runEngine,500);
				}
			}
			drawStar(shipX,shipY,starX,starY,gamelevel-(int_star-6));
			drawShip(shipX,shipY,shipRad);
  		break;
	}
}


function gameOver(){
    var msg = {type:'sendscore', user:username, score:score_val};
    socket.json.send(msg);
}


/*******************************************************************************
  Copyright (C) 2009 Tom Stoeveken
  This program is free software;
  you can redistribute it and/or modify it under the terms of the
  GNU General Public License, version 2.
  See the file COPYING for details.
*******************************************************************************/

var img1 = null;
var img2 = null;
var md_canvas = null;

function setupMotionDetection() {
  md_canvas = document.getElementById('mdCanvas');
  md_canvas.width = vid_width;
  md_canvas.height = vid_height;
}

/*
  compare two images and count the differences

  input.: image1 and image2 are Image() objects
  input.: threshold specifies by how much the color value of a pixel
          must differ before they are regarded to be different

  return: number of different pixels
*/

function compare(image1, image2, ptX, ptY, threshold, ObjR) {
  var movement = new Array(0,0,0,0);
  var md_ctx = md_canvas.getContext("2d");
  var width = md_canvas.width/2, height = md_canvas.height/2;

  // copy images into canvas element
  // these steps scale the images and decodes the image data
  md_ctx.drawImage(image1, 0, 0, width, height);
  md_ctx.drawImage(image2, width, 0, width, height);

  // this makes r,g,b,alpha data of images available
  var pixels1 = md_ctx.getImageData(0, 0, width, height);
  var pixels2 = md_ctx.getImageData(width, 0, width, height);
  
  // substract picture1 from picture2
  // if they differ set color value to max,
  // if the difference is below threshold set difference to 0.
  for (var x = Math.round((ptX-ObjR)/2); x < Math.round((ptX+ObjR)/2); x++) {
    for (var y = Math.round((ptY-ObjR)/2); y < Math.round((ptY+ObjR)/2); y++) {

      // each pixel has a red, green, blue and alpha value
      // all values are stored in a linear array
      var i = x*4 + y*4*pixels1.width;

      var ch0 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch1 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch2 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;

      // count differing pixels
      var n = (x<Math.round(ptX/2))?0:1;
      var m = (y<Math.round(ptY/2))?0:2;
      movement[n+m] += Math.min(1, ch0 + ch1 + ch2);
    }
  }
  return movement;
}
