(function() {
  'use strict';

  /*socket = io.connect();
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
	//console.dir(blockdata);
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
  });*/
  
  
  app = app || {};
  
  app.Lab = Backbone.Model.extend({
    url: '/account/lab/',
    defaults: {
      userid: '',
      timestamp: ''
    }
  });

  app.ControlView = Backbone.View.extend({
    el: '#valve_control_area',
    template: _.template( $('#tmpl-valve_control').html() ),
    events: {
      'click .btn-trigger': 'reqTrigger',
      'click .btn-open': 'reqOpen',
      'click .btn-close': 'reqClose'
    },
    initialize: function() {
      this.model = new app.Lab();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
      
      document.getElementById("btn_open").disabled = true; 
      document.getElementById("btn_close").disabled = true; 
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes));
    },
    reqTrigger: function() {
      console.log('REQ: triggier valve');
    },
    reqOpen: function() {
      console.log('REQ: open valve');
    },
    reqClose: function() {
      console.log('REQ: close valve');
    }
  });
  
  
  $(document).ready(function() {
    app.controlView = new app.ControlView();
  });
    
}());
