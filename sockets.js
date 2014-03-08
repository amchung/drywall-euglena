'use strict';

exports = module.exports = function(app) {
  app.io.sockets.on('connection', function(socket) {
    socket.on('/about/#join', require('./events/about/index').join(app, socket));
    socket.on('/about/#send', require('./events/about/index').send(app, socket));
    socket.on('/timeline/#join', require('./events/account/timeline/index').join(app, socket));
    socket.on('/timeline/#callblocks', require('./events/account/timeline/index').callblocks(app, socket));
    socket.on('/timeline/#reserve', require('./events/account/timeline/index').reserve(app, socket));
  });
};