// Informant game server
exports.rooms = {};
exports.addListener = function(io) {
    var infNamespace = io.of('/informant');
    infNamespace.on('connection', function(socket) {
        console.log('new Informant connection');
    });
};
