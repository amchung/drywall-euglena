'use strict';

exports = module.exports = function(app) {
  app.io.sockets.on('connection', function(socket) {
    socket.on('/about/#join', require('./events/about/index').join(app, socket));
    socket.on('/about/#send', require('./events/about/index').send(app, socket));
    socket.on('/timeline/#join', require('./events/account/timeline/index').join(app, socket));
    socket.on('/timeline/#clock', require('./events/account/timeline/index').clock(app, socket));
    //socket.on('/timeline/#blocks-delivery', require('./events/account/timeline/index').blocks-delivery(app, socket));
    //socket.on('/timeline/#reserve', require('./events/account/timeline/index').reserve(app, socket));
  });
};