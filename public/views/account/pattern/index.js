/* global app:true, io:false */

var socket;
var myname;
var block_id;
var pattern_array = [];
var pattern_string = [];

(function() {
  'use strict';

  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/pattern/#join');
	socket.emit('/pattern/#getnextid');
  });
  
  socket.on('message', function (message) {
      console.log(message);
  });

  socket.on('/pattern/#nextpattern', function(message){
      console.log(message);
      var info_div = document.getElementById("info_box");
      var info_text = document.createElement("h6");
      var block_node = document.createTextNode("Editing pattern id # : "+message);
	info_text.appendChild(block_node);
	info_div.appendChild(info_text);
	document.getElementById('input_title').value = 'pattern_id_' + message;
  });
  
  socket.on('/pattern/#patternsaved', function(message){
      console.log(message);
  });
  
  socket.on('/pattern/#postblocks', function(message){
      console.log(message);
  });
  
  socket.on('/pattern/#postpatterns', function(message){
      console.log(message.length);
  });
  
  socket.on('disconnect', function() {
      console.log('>>> DB disconnected');
  });
  
  app = app || {};
  
  app.Patterns = Backbone.Model.extend({
    url: '/account/pattern/',
    defaults: {
      userid: '',
      timestamp: ''
    }
  });

  app.PatternView = Backbone.View.extend({
    el: '#pattern_menu',
    template: _.template( $('#tmpl-pattern_menu').html() ),
    events: {
      'click .btn-check': 'reqCheck',
      'click .btn-edit': 'reqEdit',
      'click .btn-submit': 'reqSubmit',
      'keydown .input-tags': 'createTag'
    },
    initialize: function() {
      this.model = new app.Patterns();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
      
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true; 
      setupVis();
      socket.emit('/pattern/#listpatterns');
    },
    render: function() {
      this.$el.html(this.template);
    },
    createTag: function(e) {
      if(e.which == 188){
         var tag = document.getElementById("input_tags").value;
         console.log(tag);
      }
    },
    reqCheck: function() {
      document.getElementById("btn_check").disabled = true;
      document.getElementById("btn_submit").disabled = false;
      document.getElementById("btn_edit").disabled = false;
      document.getElementById("pattern_input").disabled = true; 
      var input = document.getElementById("pattern_input").value.split(/\n/);
      input = cleanArray(input);
      
      var str_time = [];
      var str_led = [];
      
      pattern_array = [];
      input.forEach(function(line){
	    var res = line.split(",");
	    var pattern = new Object();
	    pattern.id = res[0];
	    pattern.msec = res[1];
	    pattern.led = res[2];
	    pattern_array.push(pattern);
	    str_time = str_time + pattern.msec +"$$";
	    str_led = str_led + "0&&" + pattern.led + "$$";
      });
      console.log(str_led);
      console.log(str_time);
      console.log(pattern_array);
      
      pattern_string = str_time + "%%" + str_led;
      console.log(pattern_string);
      
      drawVis(pattern_array);
    },
    reqEdit: function() {
      document.getElementById("btn_check").disabled = false;
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true;
      document.getElementById("pattern_input").disabled = false; 
    },
    reqSubmit: function() {
      document.getElementById("btn_check").disabled = true;
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true;
      
      console.log(block_id + "  :  "+ pattern_string)
      var title_value = document.getElementById("input_title").value;
      socket.emit('/pattern/#savepattern', { title: title_value, pattern:pattern_string});
    }
  });
  
  $(document).ready(function() {
    app.patternView = new app.PatternView();
  });
  
}());


function cleanArray(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i].length > 0){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}

function redis_zadd(key,z,value){
	client.zadd(key,z,value, function(err) {
		if (err) {
		   console.error("error: zadd");
		} else {
			client.zrangebyscore(key, d, d, function(err, value) {
				 if (err) {
					 console.error("error:zrangebyscore");
				 } else {
					 console.log(">>>> >>"+key+" : "+ value);
					 socket.emit('/back/arduino/#excutedRequest', ">>>> >>"+key+" : "+ value);
				 }
			});
		  }
	});
}

/////////////////////////////
// Canvas setup functions
/////////////////////////////

var margin = {top: 20, right: 20, bottom: 30, left: 60},
	width = 500 - margin.left - margin.right,
	height = 3600 - margin.top - margin.bottom;

var format = d3.time.format("%M:%S");
var y, color, yAxis, svg_vis;

function setupVis(){
    y = d3.time.scale()
	.domain([d3.time.minute.offset(new Date(0), 5), new Date(0)])
	.range([height, 0]);
    
    color = d3.scale.category10();
    
    yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(d3.time.seconds, 5)
	.tickFormat(format);
	
    svg_vis = d3.select("#pattern_vis").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg_vis.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    
    svg_vis.append("g")         
        .attr("class", "grid")
        .attr("transform", "translate(1,0)")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat(""));
	
    function make_y_axis() {        
	return d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(250);
    }
}

function drawVis(data){
    svg_vis.selectAll('g.spot').remove();
    
    var pattern = svg_vis.selectAll('.plot')
	  .data(data)
      .enter().append("g")
	  .attr("class", "spot")
	  .attr("transform", function (d,i) 
		{ 
			var dx = (d.msec-Math.floor(d.msec/1000)*1000)/2.5;
			var dy = y(d3.time.second.offset(new Date(0), Math.floor(d.msec/1000)))+1;
			return "translate(" + dx + ","+ dy + ")"; 
		});
	  
      pattern.append('rect')
	  .attr('width', 38)
	  .attr('height', 10);
	  
      pattern.append('text')
	  .attr('class', 'arrow')
	  .attr('font-family', 'FontAwesome')
	      .style('font-size', '100%' )
	      .attr("x",2)
	      .attr("y",10)
	      .text(function(d) { return '\uf0d8' })
	      .style("opacity", function(d) {
		  var array = d.led.split("^");
	          return parseFloat(array[0])
	      });
      
      pattern.append('text')
	  .attr('class', 'arrow')
	  .attr('font-family', 'FontAwesome')
	      .style('font-size', '100%' )
	      .attr("x",12)
	      .attr("y",10)
	      .text(function(d) { return '\uf0d9' })
	      .style("opacity", function(d) {
		  var array = d.led.split("^");
	          return parseFloat(array[1])
	      });
	
      pattern.append('text')
	  .attr('class', 'arrow')
	  .attr('font-family', 'FontAwesome')
	      .style('font-size', '100%' )
	      .attr("x",20)
	      .attr("y",10)
	      .text(function(d) { return '\uf0d7' })
	      .style("opacity", function(d) {
		  var array = d.led.split("^");
	          return parseFloat(array[2])
	      });
      
      pattern.append('text')
	  .attr('class', 'arrow')
	  .attr('font-family', 'FontAwesome')
	      .style('font-size', '100%' )
	      .attr("x",30)
	      .attr("y",10)
	      .text(function(d) { return '\uf0da' })
	      .style("opacity", function(d) {
		  var array = d.led.split("^");
	          return parseFloat(array[3])
	      });
}
