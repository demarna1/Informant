// Informant game server
exports.socketServer = function(app, server) {
    var io = require('socket.io')(server);
    var infNamespace = io.of('/informant');
    infNamespace.on('connection', function(socket) {
        console.log('new Informant connection');
    });
};
