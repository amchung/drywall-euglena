/* global app:true, io:false */

var socket;
var myname;
var block_id;
var pattern_array = [];
var pattern_string;

(function() {
  'use strict';

  /*socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/replay/#join');
  });
  
  socket.on('message', function (message) {
      console.log(message);
  });
  
  socket.on('disconnect', function() {
      console.log('>>> DB disconnected');
  });*/
  
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
      return '/account/pattern/' + this.get('block_id') +'/';
    }
  });

  app.PatternView = Backbone.View.extend({
    el: '#pattern_menu',
    template: _.template( $('#tmpl-pattern_menu').html() ),
    events: {
      'click .btn-check': 'reqCheck',
      'click .btn-edit': 'reqEdit',
      'click .btn-submit': 'reqSubmit'
    },
    initialize: function() {
      //this.model = new app.Blocks();
      //this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template);
    },
    reqCheck: function() {
      document.getElementById("btn_check").disabled = true;
      document.getElementById("btn_submit").disabled = false;
      document.getElementById("btn_edit").disabled = false;
      document.getElementById("pattern_input").disabled = false; 
      var input = document.getElementById("pattern_input").value.split(/\n/);
      input = cleanArray(input);
      
      input.forEach(function(line){
	    var res = line.split(",");
	    pattern_array.push(res);
      });
      console.log(pattern_array);
      
      pattern_string = input.join("&&");
      console.log(pattern_string);
    },
    reqEdit: function() {
      document.getElementById("btn_check").disabled = false;
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true;
      document.getElementById("pattern_input").disabled = true; 
    },
    reqSubmit: function() {
      document.getElementById("btn_check").disabled = true;
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true; 
      console.log("Submit");
    }
  });
  
  app.Router = Backbone.Router.extend({
    routes: {
      'account/pattern/': 'default',
      'account/pattern/load/:block/': 'load'
    },
    default: function(){
      console.log(" >>default view, nothing loaded");
    },
    load: function(block) {
      console.log(">> loading block "+block);
      block_id = block;
      var info_div = document.getElementById("info_box");
      var info_text = document.createElement("h6");
      var block_node = document.createTextNode("Pattern for [ block # "+block_id+" ]");
      var pattern_node = document.createTextNode(" -  [ pattern # "+" ]");
	info_text.appendChild(block_node);
	info_text.appendChild(pattern_node);
	info_div.appendChild(info_text);
      document.getElementById("btn_submit").disabled = true;
      document.getElementById("btn_edit").disabled = true; 
      //socket.emit('/replay/#callblock', { targetBlock: block});
      setupVis();
    }
  });
  
  $(document).ready(function() {
    app.patternView = new app.PatternView();
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
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


/////////////////////////////
// Canvas setup functions
/////////////////////////////

var 	svg_led;

function setupVis(){
    d3.select("#pattern_vis").selectAll("svg")
	.remove();
  
    svg_vis = d3.select("#pattern_vis").append("svg")
	.attr("width", 300)
	.attr("height", 900)
	.append("g");
	//.attr("transform", "translate(4, 4)");
}
	
 /*   var frame = svg_data_vis.selectAll(".frame")
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
	    .attr("height", 8);*/
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
    /*frame.append("line")
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
	    */