/* global app:true, io:false */

var socket;
var myname;
var block_id;
var blockData;
var ledData;
var ledTime;
var imageData;
var imageTime;
var timeline;

(function() {
  'use strict';
  
  //var blockdata = [];
  //var qs = new Querystring();
  //var block_id = qs.get("myBlock");

  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/replay/#join');
  });
  
  socket.on('/replay/#postdata', function(data){
  	blockData = [];
	ledData = [];
	ledTime = [];
	blockData.push(data[0]); // time
	blockData.push(data[1]); // owner
	blockData.push(data[2]); // experiment id
	blockData.push(data[3]); // pattern id
	
	// image dir = 171.65.102.132:3001/blockid/
	
	for (var i=0;i<data[4].length/2;i++)
	{
	  ledData.push(data[4][i*2]);
	  ledTime.push(Math.round(parseInt(data[4][i*2+1])/100)*100);
	}
	
	console.log(ledData);
	console.log(ledData.length);
	console.log(ledTime);
	console.log(ledTime.length);

	socket.emit('/replay/#callimglist', { targetBlock: block_id});
  });
  
  socket.on('/replay/#postimglist', function(data){
	imageData = [];
	imageTime = [];
	timeline = [];
	data.forEach(function(filename){
	    var res = filename.split(".");
	    imageTime.push(Math.round(parseInt(res[0])/100)*100);
	    imageData.push(filename);
	});
	
	console.log(imageData);
	console.log(imageData.length);
	console.log(imageTime);
	console.log(imageTime.length);
	
	setupCanvas();
	getVideo(imageData[0]);
	//var path = '../../Dropbox/live-gallery/'+targetBlock;
  });
  
  socket.on('/replay/#newUser', function(user) {
      myname = user;
      console.log('>>> DB connected' + block_id);
  });
  
  socket.on('message', function (message) {
  	console.log(message);
  });
  
  socket.on('disconnect', function() {
	console.log('>>> DB disconnected');
  });
  
  
  
  app = app || {};
  
  app.Reset = Backbone.Model.extend({
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      blockid: undefined,
      confitm: ''
    },
    url: function(){
      return '/account/replay/' + this.get('block_id') +'/';
    }
  });

  app.MovieView = Backbone.View.extend({
    el: '#playback_nav',
    template: _.template( $('#tmpl-movie_nav').html() ),
    events: {
      'click .btn-play': 'reqPlay',
      'click .btn-stop': 'reqStop',
      'click .btn-first': 'reqFirstFrame'
    },
    initialize: function() {
      //this.model = new app.Blocks();
      //this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template);
    },
    reqPlay: function() {
      console.log("PLAY");
    },
    reqStop: function() {
      console.log("STOP");
    },
    reqFirstFrame: function() {
      console.log("1st frame");
    }
  });
  
  app.Router = Backbone.Router.extend({
    routes: {
      'account/replay/': 'default',
      'account/replay/load/:block/': 'load'
    },
    default: function(){
      console.log(" >>default view, nothing loaded");
    },
    load: function(block) {
      console.log(">> loading block "+block);
      block_id = block;
      socket.emit('/replay/#callblock', { targetBlock: block});
    }
  });
  
  $(document).ready(function() {
    app.movieView = new app.MovieView();
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
  });
    
  
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
	led_D,
	vid_canvas,
	svg_led,
	vid_context;

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

var 	vid_width = 640,
	vid_height = 480,
	m = 20,
	degrees = 180 / Math.PI;


function drawObjects(){
	led_U.style("opacity",arrow.int1);
	led_L.style("opacity",arrow.int2);
	led_D.style("opacity",arrow.int3);
	led_R.style("opacity",arrow.int4);
}

function getVideo(frame_img_name){
	getVidFrame("http://171.65.102.132:3001/" + block_id +"/"+ frame_img_name, function(image) {
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
