/* global app:true, io:false */

var socket;
var myname;
var block_id;
var blockData;
var ledArray;
var ledData;
var imageData;
var imageTime;
var frameData;
var current_frame=0;
var imageArray=[];

var frameTimer;

function frameTimerFunc()
{
  if (current_frame < imageData.length) {
    current_frame = current_frame + 1;
    getVideo(imageData[current_frame]);
    draw(frameData);
  }else{
    frameTimerStop();
  }
}

function frameTimerStop() {  clearInterval(frameTimer);  }

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
	blockData.push(data[0]); // time
	blockData.push(data[1]); // owner
	blockData.push(data[2]); // experiment id
	blockData.push(data[3]); // pattern id
	ledArray = data[4];
	
	// image dir = 171.65.102.132:3001/blockid/
      
	//console.dir(ledData);
	
	var info_p = document.createElement("p");
	var info_node_0 = document.createTextNode("Block ID: "+block_id);
	var info_node_1 = document.createTextNode("Block Start Time: "+data[0]);
	var info_node_2 = document.createTextNode("Owner : "+data[1]);
	var info_node_3 = document.createTextNode("Experiment : experiment id "+data[2]);
	var info_node_4 = document.createTextNode("Pattern : "+ (data[3] == 0 ? "Freeform Experiment" : "pattern id "+data[3]));
	info_p.appendChild(info_node_0);
	info_p.appendChild(document.createElement("br"));
	info_p.appendChild(info_node_1);
	info_p.appendChild(document.createElement("br"));
	info_p.appendChild(info_node_2);
	info_p.appendChild(document.createElement("br"));
	info_p.appendChild(info_node_3);
	info_p.appendChild(document.createElement("br"));
	info_p.appendChild(info_node_4);

	var info_box_div = document.getElementById('info_box');
	info_box_div.appendChild(info_p);		
	
	//console.log(ledData);
	//console.log(ledData.length);
	//console.log(ledTime);
	//console.log(ledTime.length);

	socket.emit('/replay/#callimglist', { targetBlock: block_id});
  });
  
  socket.on('/replay/#postimglist', function(data){
	imageData = [];
	imageTime = [];
	data.forEach(function(filename){
	    var res = filename.split(".");
	    imageTime.push(Math.round(parseInt(res[0])/100)*100);
	    imageData.push(filename);
	});
	
	//console.log(imageData);
	//console.log(imageData.length);
	//console.log(imageTime);
	//console.log(imageTime.length);
	
	for (var i=0;i<ledArray.length/2;i++)
	{
	  //ledData.push(data[4][i*2]);
	  //ledTime.push(Math.round(parseInt(data[4][i*2+1])));
	  
	  var led = new Object();
	  led.id = i;
	  led.time = parseInt(ledArray[i*2+1]);
	  led.msec = led.time - imageTime[0];
	  var arr = ledArray[i*2].split("&&");
	  led.arrow = arr[1].split("^");
	  
	  ledData.push(led);
	}
	
	setupCanvas();
	//getVideo(imageData[current_frame]);
	datavis_width = 100*datavis_x_gap+20;
	datavis_height = Math.ceil(imageData.length/100)*datavis_y_gap+20;
	
	frameData = [];
	for (var i=0;i<=imageData.length;i++){
		var frame = new Object();
		frame.id = i;
		frame.msec_original = imageTime[i];
		frame.msec = imageTime[i]-imageTime[0];
		
		var d = new Date(0);
		d.setTime(imageTime[i]);
		frame.time = d;
		
		frame.ledarray = [];
		if (i<imageData.length) {
		    frame.ledarray = ledData.filter(function (el) {
			  return el.time >= imageTime[i] &&
			  el.time < imageTime[i+1];
		    });
		}
		frameData.push(frame);
	}
	console.dir(frameData);
	draw(frameData);
	loadimages();
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
      frameTimer=setInterval(function(){frameTimerFunc()},200);
    },
    reqStop: function() {
      frameTimerStop();
    },
    reqFirstFrame: function() {
      frameTimerStop();
      current_frame = 0;
      getVideo(imageData[current_frame]);
      draw(frameData);
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
      
      var mydiv = document.getElementById("download_box");
      var aTag = document.createElement('a');
      aTag.setAttribute('href',"yourlink.htm");
      aTag.innerHTML = " Download Image Data (.zip)";
      mydiv.appendChild(aTag);
      var aTag2 = document.createElement('a');
      aTag2.setAttribute('href',"yourlink.htm");
      aTag2.innerHTML = "Download Light Stimuli Data (.csv)";
      mydiv.appendChild(aTag2);
      
      block_id = block;
      socket.emit('/replay/#callblock', { targetBlock: block});
    }
  });
  
  $(document).ready(function() {
    app.movieView = new app.MovieView();
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
  });
}());


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
	vid_context,
	svg_data_vis;
	
var 	vid_width = 640,
	vid_height = 480,
	m = 20,
	degrees = 180 / Math.PI,
	datavis_width = 100,
	datavis_height = 100,
	datavis_x_gap = 10;
	datavis_y_gap = 16;

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


function updateLEDs(arrow){
	led_U.style("opacity",arrow.int1);
	led_L.style("opacity",arrow.int2);
	led_D.style("opacity",arrow.int3);
	led_R.style("opacity",arrow.int4);
}

var draw = function(d3data){ 
    d3.select("svg")
	.remove();
    
    /*var tip = d3.tip()
	.attr('class', 'd3-tip')
	.direction('e')
	.offset([0,10])
	.html(function(d) {
		return "time: "+d.time;
	});*/

    svg_data_vis = d3.select("#data_vis_box").append("svg")
	    .attr("width", datavis_width)
	    .attr("height", datavis_height)
	    .append("g");
	    //.attr("transform", "translate(4, 4)");

    //svg.call(tip);
	
    var frame = svg_data_vis.selectAll(".frame")
	    .data(d3data)
    .enter().append("g")
	    .attr("class", "block")
	    .attr("transform", function (d,i) 
	    { 
		    var dx = (i+1)%100*datavis_x_gap;
		    var dy = 20 + Math.floor((i+1)/100)*datavis_y_gap;
		    return "translate(" + dx + ","+ dy + ")"; 
	    });
	    //.on('mouseover', tip.show)
	    //.on('mouseout', tip.hide);
	    
    frame.append("rect")
	    .attr("class", function (d,i)
	    {
		    var class_name;
		    if(i==current_frame){
		      class_name="current-frame";
		    }
		    else{
		      if (d.ledarray.length>0){
			    class_name="frame-with-led";
		      }else{
			    class_name="frame-no-led";
		      }
		      
		    }
		    return class_name;
	    })
	    .attr("width", 8)
	    .attr("height", 8);
	    /*.attr("led", function (d){
		    if (d.ledarray.length>0){
			    return true;
		    }else{
			    return false
		    }
	    });*/
	    //.on('mouseover', tip.show)
	    //.on('mouseout', tip.hide)
	    //.on('click', mouseclick);
    frame.append("line")
	    .attr("class", function (d,i)
	    {
		    var class_name = "stroke-led";
		    return class_name;
	    })
	    .attr("x1", 4)
	    .attr("y1", 4)
	    .attr("x2", function (d){
	      if (d.ledarray.length>0) {
		var x2=0;
		
		d.ledarray.forEach(function(ele){
		  x2 = x2 + parseFloat(ele.arrow[1])*8 - parseFloat(ele.arrow[3])*8;
		  /*console.log(parseFloat(ele.arrow[1])*4);
		  console.log(parseFloat(ele.arrow[3])*4);
		  console.log(parseFloat(ele.arrow[0])*4);
		  console.log(parseFloat(ele.arrow[2])*4);
		  console.log("=========")*/
		});
		
		return 4 + x2/(d.ledarray.length)
	      }else{
		return 4
	      }
	    })
	    .attr("y2",function (d){
	      if (d.ledarray.length>0) {
		var y2=0;
		
		d.ledarray.forEach(function(ele){
		  y2 = y2 + parseFloat(ele.arrow[0])*8 - parseFloat(ele.arrow[2])*8;
		});
		
		return 4 + y2/(d.ledarray.length)
	      }else{
		return 4
	      }
	      
	      return 4
	    });
	    
    /*block.append("text")
	    .attr("class", function (d)
	    {
		    var class_name;
		    if (d.username==myname){
			    class_name="my-block-name";
		    }else{
			    class_name="not-my-block-name";
		    }
		    return class_name;
	    })
	    .attr("x",10)
	    .attr("y",14)
	    .attr("dy", ".3em")
	    .text(function(d) { 
		    var h = d.time.getHours();
		    var ampm = (h<12 ? "a":"p");
		    //h=("0" + h%12).slice(-2);
		    h=(h%12);
		    if(h==0){h="12";}
		    var m = d.time.getMinutes();
		    m=("0" + m).slice(-2);
		    return h+":"+m+ampm;
	    })
	    .on('mouseover', tip.show)
	    .on('mouseout', tip.hide);*/
	    
    /*block.append('text')
	    .attr("class", function (d){
		    var class_name;
		    if (d.username==myname){
			    class_name="my-block-name";
		    }else{
			    class_name="not-my-block-name";
		    }
		    return class_name;})
	    .attr('font-family', 'FontAwesome')
	    .style('font-size', '150%' )
	    .attr("x",22)
	    .attr("y",44)
	    .text(function(d) { return '\uf023' })
	    .style("display", function(d) {
		    return d.lock == true ? null : "none"; 
	    });*/
    /*var currentframe_g = document.getElementsByClassName("current-frame");
	currentframe_g.scrollIntoView(true);*/
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

function loadimages(){
    imageArray = [];

    for (x = 0; x < imageData.length; x++) {
      getVidFrame("http://171.65.102.132:3001/" + block_id +"/"+ imageData[x], function(image) {
	imageArray.push(image);
      });
    }
    console.log(imageArray);
    vid_context.clearRect(20, 20, vid_width+20, vid_height+20);
    vid_context.drawImage(imageArray[0], 20, 20, vid_width, vid_height);
};