// Cards Against Humanity game server
exports.socketServer = function(app, server) {
    var io = require('socket.io')(server);
    var infNamespace = io.of('/cah');
    infNamespace.on('connection', function(socket) {
        console.log('new CAH connection');
    });
};
