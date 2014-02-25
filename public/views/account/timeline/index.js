/* global app:true */

(function() {
  'use strict';

  app = app || {};
  
  app.Blocks = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/timeline/',
    defaults: {
      reqTime:'',
      blockdata: [],
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
      this.model.save({
        reqTime: '',
        username: '',
        timestamp: ''
      },{
        success: function(model, response) {
          if (response.success) {
            location.href = '/login/';
          }
          else {
            model.set(response);
          }
        }
      });
    },
    reqNow: function() {
      // request new hour
    },
    reqNext: function() {
      // request new hour
    }
  });