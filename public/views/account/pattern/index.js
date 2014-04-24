/* global app:true, io:false */

var socket;
var myname;
var block_id;

(function() {
  'use strict';

  /*socket = io.connect();
  socket.on('connect', function(){
  	socket.emit('/replay/#join');
  });
  
  socket.on('message', function (message) {
      console.log(message);
  });
  
  socket.on('disconnect', function() {
      console.log('>>> DB disconnected');
  });*/
  
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
      return '/account/pattern/' + this.get('block_id') +'/';
    }
  });

  app.PatternView = Backbone.View.extend({
    el: '#pattern_menu',
    template: _.template( $('#tmpl-pattern_menu').html() ),
    events: {
      'click .btn-check': 'reqCheck',
      'click .btn-submit': 'reqSubmit'
    },
    initialize: function() {
      //this.model = new app.Blocks();
      //this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template);
    },
    reqCheck: function() {
      console.log("Check");
    },
    reqSubmit: function() {
      console.log("Submit");
    }
  });
  
  app.Router = Backbone.Router.extend({
    routes: {
      'account/pattern/': 'default',
      'account/pattern/load/:block/': 'load'
    },
    default: function(){
      console.log(" >>default view, nothing loaded");
    },
    load: function(block) {
      console.log(">> loading block "+block);
      block_id = block;
      //socket.emit('/replay/#callblock', { targetBlock: block});
    }
  });
  
  $(document).ready(function() {
    app.patternView = new app.PatternView();
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
  });
}());