'use strict';

exports = module.exports = function(app) {
  app.io.sockets.on('connection', function(socket) {
    socket.on('/about/#join', require('./events/about/index').join(app, socket));
    socket.on('/about/#send', require('./events/about/index').send(app, socket));
    socket.on('/timeline/#join', require('./events/account/timeline/index').join(app, socket));
    socket.on('/timeline/#callblocks', require('./events/account/timeline/index').callblocks(app, socket));
    socket.on('/timeline/#reserveblock', require('./events/account/timeline/index').reserveblock(app, socket));
    socket.on('/timeline/#cancelblock', require('./events/account/timeline/index').cancelblock(app, socket));
    socket.on('/timeline/#setfreeform', require('./events/account/timeline/index').setfreeform(app, socket));
    socket.on('/lab/#access', require('./events/account/lab/index').labaccess(app,socket));
    //socket.on('/lab/#valvetrigger', require('./events/account/lab/index').valvetrigger(app,socket));
  });
};