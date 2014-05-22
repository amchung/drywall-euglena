/* global app:true, io:false */

var socket;
var myname;


(function() {
  'use strict';

  socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/spectate/#join');
  });
  
  socket.on('/spectate/#newUser', function(user) {
    myname=user;
    currenttime = new Date();
  	callBlocks(currenttime);
  	console.log('>>> timeline connected');
  });callBlocks(currenttime);
  });
  
  socket.on('message', function (message) {
  	console.log(message);
  });
  
  socket.on('disconnect', function() {
	console.log('>>> timeline disconnected');
  });
  
  
  app = app || {};
  
  app.Blocks = Backbone.Model.extend({
    url: '/account/spectate/',
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
      'click .btn-access': 'reqDataAccess',
      'click .btn-cancel': 'reqCancel'
    },
    initialize: function() {
      this.model = new app.Blocks();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
      
      document.getElementById("btn_enter").disabled = true; 
      document.getElementById("btn_access").disabled = true; 
      document.getElementById("btn_reserve").disabled = true; 
      document.getElementById("btn_pattern").disabled = true; 
      document.getElementById("btn_cancel").disabled = true; 
      
      document.getElementById("btn_enter").style.display="none";
      document.getElementById("btn_access").style.display="none";
      document.getElementById("btn_pattern").style.display="none";
      document.getElementById("btn_cancel").style.display="none";
      
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
    	console.log("Sent request: Set Pattern for " + selected_block_time);
    	//socket.emit('/timeline/#setexp', {username:myname, targettime: selected_block_time,  freeform:0});
	socket.emit('/timeline/#accesspattern', { targettime: selected_block_time});
    },
    reqDataAccess: function() {
    	console.log("Sent request: Data Access");
	// >>>>>> socket: access block data
    	socket.emit('/timeline/#accessblock', { targettime: selected_block_time});
    },
    reqEnterFreeform: function() {
    	console.log("Sent request: Enter " + selected_block_time);
    	socket.emit('/timeline/#setfreeform', {username:myname, targettime: selected_block_time, freeform:1});
    },
    reqCancel: function() {
    	console.log("Sent request: Cancel Block Reservation");
    	// >>>>>> socket: cancel reserve block
    	socket.emit('/timeline/#cancelblock', {targettime:selected_block_time});
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
