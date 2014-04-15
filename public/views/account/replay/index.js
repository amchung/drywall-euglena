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
	
	console.log(blockData);
	console.log(ledData);
	console.log(ledData.length);
	console.log(ledTime);
	console.log(ledTime.length);
  });
  
  socket.on('/replay/#postimglist', function(data){
	imageData = [];
	imageTime = [];
	timeline = [];
	data.forEach(function(filename){
	    var res = filename.split(".");
	    imageTime.push(parseInt(res[0]));
	    imageData.push(filename);
	});
	
	console.log(imageData);
	console.log(imageData.length);
	console.log(imageTime);
	console.log(imageTime.length);
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

  /*app.BlocksView = Backbone.View.extend({
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
  });*/
  
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
    //app.blocksView = new app.BlocksView();
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
  });
    
}());
