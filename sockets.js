'use strict';

exports = module.exports = function(app) {
  app.io.sockets.on('connection', function(socket) {
    socket.on('/about/#join', require('./events/about/index').join(app, socket));
    socket.on('/about/#send', require('./events/about/index').send(app, socket));
    socket.on('/spectate/#join', require('./events/account/spectate/index').join(app, socket));
    socket.on('/spectate/#send', require('./events/account/spectate/index').send(app, socket));
    socket.on('/timeline/#join', require('./events/account/timeline/index').join(app, socket));
    socket.on('/timeline/#callblocks', require('./events/account/timeline/index').callblocks(app, socket));
    socket.on('/timeline/#reserveblock', require('./events/account/timeline/index').reserveblock(app, socket));
    socket.on('/timeline/#cancelblock', require('./events/account/timeline/index').cancelblock(app, socket));
    socket.on('/timeline/#setfreeform', require('./events/account/timeline/index').setfreeform(app, socket));
    socket.on('/timeline/#getpatterns', require('./events/account/timeline/index').getpatterns(app, socket));
    socket.on('/timeline/#setpattern', require('./events/account/timeline/index').setpattern(app, socket));
    socket.on('/timeline/#accessblock', require('./events/account/timeline/index').accessblock(app, socket));
    socket.on('/lab/#access', require('./events/account/lab/index').labaccess(app,socket));
    socket.on('/lab/#broadcast', require('./events/account/lab/index').broadcast(app, socket));
    socket.on('/replay/#join', require('./events/account/replay/index').join(app, socket));
    socket.on('/replay/#callblock', require('./events/account/replay/index').callblock(app, socket));
    socket.on('/replay/#callimglist', require('./events/account/replay/index').callimglist(app, socket));
    socket.on('/pattern/#savepattern', require('./events/account/pattern/index').savepattern(app, socket));
    socket.on('/pattern/#listblocks', require('./events/account/pattern/index').listblocks(app, socket));
  });
};