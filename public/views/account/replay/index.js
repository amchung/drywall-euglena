/* global app:true, io:false */

var socket;
var myname;
var block_id;
var blockdata;

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
  	blockdata = [];
  	/*var num_ele = 9;
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
	blockdata.length = blockdata.length-2; */
	console.log(data);
	console.dir(data);
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
