/* global app:true */

var socket;
var currenttime;
var username='noname';

var width = 900,
	height = 500,
	cellWidth = 60,
	cellHeight = 58, // cell size
	gapWidth = 12,
	gapHeight = 16
	Dy = 64;
	//menuWidth = 60,
	//menuHeight = 30;

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
  var infobox;
  
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
		.attr("transform", "translate(4, 4)");

	svg.call(tip);
	
	var block = svg.selectAll(".block")
		.data(blockdata)
	.enter().append("g")
		.attr("class", "block")
		.attr("transform", function (d,i) 
		{ 
			//var dx = (i-i%12)/12*(cellWidth+gapWidth);
			//var dy =  i%12 * (cellHeight+gapHeight);
			var dx = i%12 * (cellWidth+gapWidth);
			var dy = Dy+(i-i%12)/12*(cellHeight+gapHeight);
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
			var ampm = (h<12 ? "a":"p");
			//h=("0" + h%12).slice(-2);
			h=(h%12);
			if(h==0){h="12";}
			var m = d.time.getMinutes();
			m=("0" + m).slice(-2);
			return h+":"+m+ampm;
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
  }
  
  function mouseclick(d,i){
	document.getElementById("btn_enter").disabled = true; 
    document.getElementById("btn_access").disabled = true; 
    document.getElementById("btn_reserve").disabled = true; 
  
  	// reset to default layout
  	d3.selectAll(".block rect").transition().duration(1000)
  		.attr("width", cellWidth)
  		.attr("height", cellHeight);
  		
  	d3.selectAll(".block").transition().duration(1000)
  		.attr("transform", function (d,i) 
		{ 
			var dx = i%12 * (cellWidth+gapWidth);
			var dy = Dy+(i-i%12)/12*(cellHeight+gapHeight);
			return "translate(" + dx + ","+ dy + ")"; 
		});
  	
  	var data;
	d3.select(this.parentNode).transition().duration(1000)
		.attr("transform", function (d) 
		{ 
			data = d;
			var dx = 200;
			var dy = 4;
			return "translate(" + dx + ","+ dy + ")"; 
		});

	// expand the selected block*/
  	d3.select(this).transition().duration(1000)
        //.attr("width", (cellWidth+gapWidth)*(3-(i-i%12)/12)+menuWidth)
        //.attr("height", menuHeight);
        .attr("width", (cellWidth+gapWidth)*4)
        .attr("height", (cellHeight+gapHeight)/2);
    
    switch(this.getAttribute("class"))
    {
    	case "block-locked":
    		document.getElementById("btn_enter").disabled = true; 
    		document.getElementById("btn_access").disabled = false; 
    		document.getElementById("btn_reserve").disabled = true;
    		document.getElementById("btn_pattern").disabled = true; 
    		break;
    	case "block-current":
    		document.getElementById("btn_enter").disabled = false; 
    		document.getElementById("btn_access").disabled = true; 
    		document.getElementById("btn_reserve").disabled = true;
    		document.getElementById("btn_pattern").disabled = true; 
    		break;
    	case "block-default":
    		document.getElementById("btn_enter").disabled = true; 
    		document.getElementById("btn_access").disabled = true; 
    		document.getElementById("btn_reserve").disabled = false;
    		document.getElementById("btn_pattern").disabled = false; 
    		break;
    }
    
    console.log(data.id);
  	console.log(data.user_id);
  	console.log(data.image);
  	/*block.time = d;
	block.lock = data[i*num_ele+1];
	block.user_id = data[i*num_ele+2];
	block.exp_id = data[i*num_ele+3];
	block.pattern_id = data[i*num_ele+4];
	block.past = data[i*num_ele+5];
	block.admin = data[i*num_ele+6];
	block.current = data[i*num_ele+7];
	block.image = data[i*num_ele+8];*/
    var strInfo;
    strInfo = "<b>"+data.time+"</b>";
    strInfo = concatNewline(strInfo,"block id:"+data.id);
    infobox.html = strInfo;
  }
  
  function concatNewline(str0,str1){
	var strHTML = str0.concat("<br>");
	strHTML = strHTML.concat(str1);
  	return strHTML
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
  	var str = data.split(":");
  	if(str[1]=='00'){
  		if((str[0]=="2")||(str[0]=="5")) {
  			callBlocks(currenttime);
  		}
  	}
  	if(str[0]=="0"){
  		clockbar.html("<b><font color='red'>"+data+"</font><b>");
  	}
  	else{
  		clockbar.html("<b>"+data+"</b>");
  	}
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
  
  app.MenuView = Backbone.View.extend({
    el: '#info_menu',
    template: _.template( $('#tmpl-info_menu').html() ),
    events: {
      'click .btn-reserve': 'reqReserve',
      'click .btn-pattern': 'reqSetPattern',
      'click .btn-enter': 'reqEnterFreeform',
      'click .btn-access': 'reqDataAccess'
    },
    initialize: function() {
      this.model = new app.Blocks();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
      document.getElementById("btn_enter").disabled = true; 
      document.getElementById("btn_access").disabled = true; 
      document.getElementById("btn_reserve").disabled = true; 
      document.getElementById("btn_pattern").disabled = true; 
      infobox = $('#info_box');
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes));
    },
    reqReserve: function() {
    	console.log("Reserve block");
    },
    reqSetPattern: function() {
    	console.log("Set Pattern");
    },
    reqDataAccess: function() {
    	console.log("Data Access");
    },
    reqEnterFreeform: function() {
    	console.log("Enter");
    }
  });
  
  $(document).ready(function() {
    app.blocksView = new app.BlocksView();
    app.menuView = new app.MenuView();
  });

  $('#d3Area').scroll(function() { 
    $('#blockArea').css('top', $(this).scrollTop());
});  
}());
