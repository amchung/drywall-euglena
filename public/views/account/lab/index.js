/* global app:true, io:false */
var socket;
var myname;
var clock_socket;
var currenttime;

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
	console.log('Clock lost');
  });
  
  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/lab/#access');
  });
  
  
  /*app = app || {};
  
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
  
  
  $(document).ready(function() {
    app.blocksView = new app.BlocksView();
  });*/
    
}());
