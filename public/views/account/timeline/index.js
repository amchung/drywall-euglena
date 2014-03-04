/* global app:true */

var socket;
var currenttime;
var username='noname';

var width = 720,
	height = 1200,
	cellWidth = 76,
	cellHeight = 72, // cell size
	gapWidth = 12,
	gapHeight = 6,
	menuWidth = 400,
	menuHeight = 100;

var hour = d3.time.format("%I"),
	minute = d3.time.format("%M"),
	month = d3.time.format("%b"),
	weekday = d3.time.format("%a"),
	date = d3.time.format("%d"),
	ampm = d3.time.format("%p"),
	format = d3.time.format("%b/%d %H:%M%p");


(function() {
  'use strict';

	var myClock;

	function myTimer(){
		socket.emit('lookclock');
	}

  var blockdata = [];
  var clockbar = $('#clock_bar');
  
  var callBlocks = function(ticket){
	// +- 1 hour blocks range
	var beginT = d3.time.hour.floor(ticket);
	beginT = d3.time.hour.offset(beginT, -1);
	var endT = d3.time.hour.offset(beginT, 3);
	
	socket.emit('timeline', { type: 'callblocks', user:username, begintime: beginT, endtime: endT});
  }
  
  var draw = function(blockdata){
    d3.select("svg")
       .remove();
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.offset([0,10])
		.html(function(d) {
			return "time: "+d.time;
		});

	var svg = d3.select("#d3Area").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(24, 24)");

	svg.call(tip);
	
	var block = svg.selectAll(".block")
		.data(blockdata)
	.enter().append("g")
		.attr("class", "block")
		.attr("transform", function (d,i) 
		{ 
			var dx = (i-i%12)/12*(cellWidth+gapWidth);
			var dy =  i%12 * (cellHeight+gapHeight);
			return "translate(" + dx + ","+ dy + ")"; 
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
		
	block.append("rect")
		.attr("class", function (d)
		{
			if (d.lock==1){
				class_name="block-locked";
			}else{
				if (d.current==1){
					class_name="block-current";
				}else{
					var class_name="block-default";
				}
			}
			return class_name;
		})
		.attr("width", cellWidth)
		.attr("height", cellHeight)
		.attr("block-hour", function (d,i){
			var class_name;
			var hour = (i-i%12)/12;
			
			if (hour==1){
				class_name="current";
			}else{
				if (hour>1){
					class_name="future";
				}else{
					var class_name="past";
				}
			}
			return class_name;
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.on('click', mouseclick);
	
	block.append("text")
		.attr("class", "block-name")
		.attr("x",10)
		.attr("y",14)
		.attr("dy", ".3em")
		//.style("text-anchor", "middle")
		.text(function(d) { 
			var h = d.time.getHours();
			var ampm = (h<12 ? "AM":"PM");
			//h=("0" + h%12).slice(-2);
			h=(h%12);
			if(h==0){h="12";}
			var m = d.time.getMinutes();
			m=("0" + m).slice(-2);
			return h+":"+m+" "+ampm;
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
  }
  
  function mouseclick(d,i){
  	// reset to default layout
  	d3.selectAll(".block rect").transition().duration(1000)
  		.attr("width", cellWidth)
  		.attr("height", cellHeight);
  		
	// expand the selected block
  	d3.select(this).transition().duration(1000)
        .attr("width", (cellWidth+gapWidth)*(3-(i-i%12)/12)+menuWidth)
        .attr("height", menuHeight);
        
    d3.select(this).append("text")
		.attr("class", "block-info")
		.attr("x",((cellWidth+gapWidth)*(3-(i-i%12)/12)+40))
		.attr("y",20)
		.attr("dy", ".3em")
		.text(function(d) { 
			//d.user_id
			//d.exp_id
			//d.id
			return "block id: "+d.id;
		})
  }
  
  socket = io.connect('http://171.65.102.132:3006');
  
  socket.on('postblocks', function(data){
  	blockdata = [];
  	var num_ele = 9;
	for (var i=0;i<=data.length/num_ele;i++){
		var block = new Object();
		block.id = i;
		
		var d = new Date(0);
		d.setTime(data[i*num_ele]);
		block.time = d;
		
		block.lock = data[i*num_ele+1];
		block.user_id = data[i*num_ele+2];
		block.exp_id = data[i*num_ele+3];
		block.pattern_id = data[i*num_ele+4];
		block.past = data[i*num_ele+5];
		block.admin = data[i*num_ele+6];
		block.current = data[i*num_ele+7];
		block.image = data[i*num_ele+8];
		
		blockdata.push(block);
	}
	blockdata.length = blockdata.length-2; 
	console.dir(blockdata);
	draw(blockdata);
  });
  
  socket.on('server_clock', function(data){
  	//console.log(data);
  	clockbar.html("<b>"+data+"</b>");
  });

  socket.on('message', function(msg){
	console.log(msg);
  });

  socket.on('connect', function() {
	console.log("Connected!");
	currenttime = new Date();
	callBlocks(currenttime);
	myClock=setInterval(function(){myTimer()},500);
  });

  socket.on('disconnect', function() {
	console.log('disconnected');
  });
  

  app = app || {};
  
  app.Blocks = Backbone.Model.extend({
    url: '/account/timeline/',
    defaults: {
      username: '',
      timestamp: ''
    }
  });

  app.BlocksView = Backbone.View.extend({
    el: '#blocks_nav',
    template: _.template( $('#tmpl-blocks_nav').html() ),
    events: {
      'click .btn-prev': 'reqPrev',
      'click .btn-now': 'reqNow',
      'click .btn-next': 'reqNext'
    },
    initialize: function() {
      this.model = new app.Blocks();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes));
    },
    reqPrev: function() {
      currenttime.setHours(currenttime.getHours() - 1);
      callBlocks(currenttime);
    },
    reqNow: function() {
      currenttime = new Date();
      callBlocks(currenttime);
    },
    reqNext: function() {
      currenttime.setHours(currenttime.getHours() + 1);
      callBlocks(currenttime);
    }
  });
  
  $(document).ready(function() {
    app.blocksView = new app.BlocksView();
  });
  
}());
