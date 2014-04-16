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
	
	console.log(ledData);
	console.log(ledData.length);
	console.log(ledTime);
	console.log(ledTime.length);

	socket.emit('/replay/#callimglist', { targetBlock: block_id});
  });
  
  socket.on('/replay/#postimglist', function(data){
	imageData = [];
	imageTime = [];
	timeline = [];
	data.forEach(function(filename){
	    var res = filename.split(".");
	    imageTime.push(Math.round(parseInt(res[0])/100)*100);
	    imageData.push(filename);
	});
	
	console.log(imageData);
	console.log(imageData.length);
	console.log(imageTime);
	console.log(imageTime.length);
	
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
      console.log("PLAY");
    },
    reqStop: function() {
      console.log("STOP");
    },
    reqFirstFrame: function() {
      console.log("1st frame");
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
