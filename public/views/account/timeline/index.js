/* global app:true, io:false */

var socket;
var myname;
var clock_socket;
var currenttime;
var selected_block_time;

var width = 900,
	height = 300,
	cellWidth = 60,
	cellHeight = 58, // cell size
	gapWidth = 12,
	gapHeight = 16,
	Dy = 80;
	
var hour = d3.time.format("%I"),
	minute = d3.time.format("%M"),
	month = d3.time.format("%b"),
	weekday = d3.time.format("%a"),
	date = d3.time.format("%d"),
	ampm = d3.time.format("%p"),
	format = d3.time.format("%b/%d %H:%M%p");


(function() {
  'use strict';

  var clockbar = $('#clock_bar');
  var myClock;
  function myTimer(){
		// >>>>>> socket: look clock
		clock_socket.emit('lookclock');
  }
  clock_socket = io.connect('http://171.65.102.132:3006');
  
  clock_socket.on('server_clock', function(data){
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

  clock_socket.on('connect', function() {
	console.log("Clock connected!");
	myClock=setInterval(function(){myTimer()},500);
  });

  clock_socket.on('disconnect', function() {
	console.log('clock lost');
  });
  
  var blockdata = [];
  var infobox;
  var previewbox;
  
  var callBlocks = function(ticket){
	// +- 1 hour blocks range
	var beginT = d3.time.hour.floor(ticket);
	beginT = d3.time.hour.offset(beginT, -1);
	var endT = d3.time.hour.offset(beginT, 3);
	console.log(beginT);
	console.log(endT);
	socket.emit('/timeline/#callblocks', { begintime: beginT, endtime: endT});
	}
  
  var draw = function(blockdata){
    document.getElementById("btn_close").style.display="none" 
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
			var dy = (i-i%12)/12*(cellHeight+gapHeight);
			return "translate(" + dx + ","+ dy + ")"; 
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
		
	block.append("rect")
		.attr("class", function (d)
		{
			var class_name;
			if (d.username==myname){
				class_name="my-block";
			}else{
				class_name="not-my-block";
			}
			
			if (d.past=="1"){
				class_name=class_name+" block-past";
			}else{
				if (d.current=="1"){
					class_name=class_name+" block-current";
				}else{
					class_name=class_name+" block-future"
				}
			}
			
			return class_name;
		})
		.attr("width", cellWidth)
		.attr("height", cellHeight)
		.attr("locked", function (d){
			if (d.lock=="1"){
				return true;
			}else{
				return false
			}
		})
		.attr("mine", function (d){
			if (d.username==myname){
				return true;
			}else{
				return false
			}
		})
		.attr("past", function (d){
			if (d.past=="1"){
				return true;
			}else{
				return false
			}
		})
		.attr("current", function (d){
			if (d.current=="1"){
				return true;
			}else{
				return false
			}
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.on('click', mouseclick);
	
	block.append("text")
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
		.on('mouseout', tip.hide);
  }
  
  function mouseclick(d,i){
	document.getElementById("btn_enter").disabled = true; 
    document.getElementById("btn_access").disabled = true; 
    document.getElementById("btn_reserve").disabled = true; 
    document.getElementById("btn_pattern").disabled = true; 
  
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
			var dx = i%12 * (cellWidth+gapWidth);
			var dy = 0;
			return "translate(" + dx + ","+ dy + ")"; 
		});
	d3.select(this.parentNode).transition().duration(1000)
		.attr("transform", function (d) 
		{ 
			data = d;
			var dx = i%12 * (cellWidth+gapWidth);
			var dy = 8;
			return "translate(" + dx + ","+ dy + ")"; 
		});
	
	if(this.getAttribute("mine")=="true"){
		console.log("MINE!!!");
		if(this.getAttribute("past")=="true"){
			console.log("from the past");
			document.getElementById("btn_access").disabled = false; 
		}else{
			if(this.getAttribute("current")=="true"){
				console.log("current block");
				document.getElementById("btn_enter").disabled = false;
			}else{
				console.log("into the future");
				document.getElementById("btn_pattern").disabled = false; 
			}
		}
	}else{
		if(this.getAttribute("locked")=="true"){
			console.log("this is locked block");
		}else{
			document.getElementById("btn_reserve").disabled = false;
		}
	}
	
	preloader();

    // preloading for block preview
    function preloader() 
	{
		if(data.image<0){
			document.getElementById("btn_close").style.display="none";
			previewbox.html("[no preview]");
			writeInfo();
		}
		else 
		{
			getPreview("http://171.65.102.132:3001/"+data.image, function(image) {
            	previewbox.html(image);
            	writeInfo();
            });
        }
        
    	function getPreview(path, callback) {
    		document.getElementById("btn_close").style.display="block"; 
            var image = new Image;
            image.id = "img_preview";
            image.src = path;
            image.setAttribute("class","img-responsive img-thumbnail");
            image.setAttribute("alt","Responsive image");
            image.onload = function() {
                callback(image);
            };
        }
	}
	
	// write block info to infobox
    function writeInfo(){
		var strInfo;
		strInfo = "<b>"+data.time+"</b>";
		strInfo = concatNewline(strInfo,"block time:"+data.blocktime);
		if(data.user_id<0){
			strInfo = concatNewline(strInfo,"[not claimed]");
		}else{
			strInfo = concatNewline(strInfo,"owner: "+data.username);
		}
		infobox.html(strInfo);
    }
    selected_block_time = data.blocktime;
  }
  
  function concatNewline(str0,str1){
	var strHTML = str0.concat("<br>");
	strHTML = strHTML.concat(str1);
  	return strHTML
  }
  
  var addChatMessage = function(data) {
    $('<div/>', { text: data }).appendTo('#date_picker');
    $("#date_picker").animate({ scrollTop: $('#date_picker')[0].scrollHeight}, 500);
  };
  
  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/timeline/#join');
  });
  
  socket.on('/timeline/#postblocks', function(data){
  	blockdata = [];
  	var num_ele = 9;
	for (var i=0;i<=data.length/num_ele;i++){
		var block = new Object();
		block.id = i;
		
		var d = new Date(0);
		d.setTime(data[i*num_ele]);
		block.time = d;
		
		block.lock = data[i*num_ele+1];
		block.username = data[i*num_ele+2];
		block.exp_id = data[i*num_ele+3];
		block.pattern_id = data[i*num_ele+4];
		block.past = data[i*num_ele+5];
		block.admin = data[i*num_ele+6];
		block.current = data[i*num_ele+7];
		block.image = data[i*num_ele+8];
		block.blocktime = data[i*num_ele];
		
		blockdata.push(block);
	}
	blockdata.length = blockdata.length-2; 
	console.dir(blockdata);
	draw(blockdata);
  });
  
  socket.on('/timeline/#newUser', function(user) {
    myname=user;
    currenttime = new Date();
  	callBlocks(currenttime);
  	console.log('>>> timeline connected');
  });
  
  socket.on('/timeline/#doneRequest', function(msg) {
  	console.log(msg);
  	callBlocks(currenttime);
  });
  
  socket.on('message', function (message) {
  	console.log(message);
  });
  
  socket.on('disconnect', function() {
	console.log('>>> timeline disconnected');
  });
  
  
  app = app || {};
  
  app.Blocks = Backbone.Model.extend({
    url: '/account/timeline/',
    defaults: {
      userid: '',
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
      previewbox = $('#preview_box');
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes));
    },
    reqReserve: function() {
    	console.log("Sent request: Reserve a Block "+selected_block_time);
    	// >>>>>> socket: reserve block
    	socket.emit('/timeline/#reserveblock', { targettime: selected_block_time});
    	
    },
    reqSetPattern: function() {
    	console.log("Sent request: Set Pattern");
    },
    reqDataAccess: function() {
    	console.log("Sent request: Data Access");
    },
    reqEnterFreeform: function() {
    	console.log("Sent request: Enter");
    }
  });
  
  $(document).ready(function() {
    app.blocksView = new app.BlocksView();
    app.menuView = new app.MenuView();
  });

  $('#d3Area').scroll(function() { 
    $('#blockArea').css('top', $(this).scrollTop());
  });
  
  $('#btn_close').click(function(){
    $('#img_preview').css('display','none');
    document.getElementById("btn_close").style.display="none";
  });
    
}());
