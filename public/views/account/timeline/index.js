/* global app:true */

var socket;
var currenttime;
var username='noname';

var width = 600,
	height = 600,
	cellWidth = 56,
	cellHeight = 36, // cell size
	gapWidth = 60;
	gapHeight = 10;

var hour = d3.time.format("%I"),
	minute = d3.time.format("%M"),
	month = d3.time.format("%b"),
	weekday = d3.time.format("%a"),
	date = d3.time.format("%d"),
	ampm = d3.time.format("%p"),
	format = d3.time.format("%b/%d %H:%M%p");

(function() {
  'use strict';

	
  var blockdata = [];
  
  var callBlocks = function(ticket){
	//console.log(month(ticket)+" "+date(ticket)+" "+hour(ticket)+":"+minute(ticket)+ampm(ticket));

	// +- 1 hour blocks range
	var beginT = d3.time.hour.floor(ticket);
	beginT = d3.time.hour.offset(beginT, -1);
	var endT = d3.time.hour.offset(beginT, 3);

	//console.log(month(beginT)+" "+date(beginT)+" "+hour(beginT)+":"+minute(beginT)+ampm(beginT));
	//console.log(month(endT)+" "+date(endT)+" "+hour(endT)+":"+minute(endT)+ampm(endT));
	
	socket.emit('timeline', { type: 'callblocks', user:username, begintime: beginT, endtime: endT});
  }
  
  var draw = function(blockdata){
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.offset([0,10])
		.html(function(d) {
			return "time: "+d.time;
		});

	var color = d3.scale.quantize()
    	.domain([-.05, .05])
    	.range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

	var svg = d3.select("#d3Area").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "RdYlGn")
	.append("g")
		.attr("transform", "translate(24, 24)");

	svg.call(tip);
	
	var column = svg.selectAll(".column")
		.data(blockdata)
	.enter().append("g")
		.attr("class", "column")
		.attr("transform", function (d,i) 
		{ return "translate("+ (i-i%12)/12 * (cellWidth+gapWidth)+ ","+i%12 * (cellHeight+gapHeight) + ")"; })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
		
	column.append("rect")
		.attr("width", cellWidth)
		.attr("height", cellHeight);
	
	column.append("text")
		.attr("class", "block-name")
		.attr("x",cellWidth/2)
		.attr("y",cellHeight/2)
		.attr("dy", ".3em")
		.style("text-anchor", "middle")
		.text(function(d) { 
			var h = d.time.getHours();
			h=("0" + h%12).slice(-2);
			var m = d.time.getMinutes();
			m=("0" + m).slice(-2);
			return h+":"+m;
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
  }
  
  socket = io.connect('http://171.65.102.132:3006');
  
  socket.on('postblocks', function(data){
	for (var i=0;i<=data.length/4;i++){
		var block = new Object();
		block.id = i;
		
		var d = new Date(0);
		d.setTime(data[i*4]);
		block.time = d;
		
		block.lock = data[i*4+1];
		block.userid = data[i*4+2];
		block.expid = data[i*4+3];
		blockdata.push(block);
	}
	blockdata.length = blockdata.length-2; 
	console.dir(blockdata);
	draw(blockdata);
  });

  socket.on('message', function(msg){
	console.log(msg);
  });

  socket.on('connect', function() {
	console.log("Connected!");
	callBlocks(new Date());
  });

  socket.on('disconnect', function() {
	console.log('disconnected');
	chat.html("<b>Disconnected!</b>");
  });
  

  app = app || {};
  
  app.Blocks = Backbone.Model.extend({
    url: '/account/timeline/',
    defaults: {
      reqStartTime:'',
      reqEndTime:'',
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
      var d = new Date(); 
      d.setHours(d.getHours() - 1);
      callBlocks(d);
    },
    reqNow: function() {
      callBlocks(new Date());
    },
    reqNext: function() {
      // request new hour
      /*this.model.save({
        reqTime: '',
        username: '',
        timestamp: ''
      },{
        success: function(model, response) {
          if (response.success) {
            location.href = '/account/timeline/';
          }
          else {
            model.set(response);
          }
        }
      });*/
      var d = new Date(); 
      d.setHours(d.getHours() + 1);
      callBlocks(d);
    }
  });
  
  $(document).ready(function() {
    app.blocksView = new app.BlocksView();
  });
  
}());