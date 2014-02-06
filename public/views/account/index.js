(function() {
  'use strict';

  $('.day-of-year').text(moment().format('DDD'));
  $('.day-of-month').text(moment().format('D'));
  $('.week-of-year').text(moment().format('w'));
  $('.day-of-week').text(moment().format('d'));
  $('.week-year').text(moment().format('gg'));
  $('.hour-of-day').text(moment().format('H'));
}());

/*(function() {
  'use strict';

  app = app || {};
  
  app.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  app.User = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.account = new app.Account( JSON.parse( unescape($('#data-account').html()) ) );
      this.user = new app.User( JSON.parse( unescape($('#data-user').html()) ) );
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());*/