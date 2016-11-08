// Cards Against Humanity game server
exports.addListener = function(io) {
    var infNamespace = io.of('/cah');
    infNamespace.on('connection', function(socket) {
        console.log('new CAH connection');
    });
};
