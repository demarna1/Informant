// Cards Against Humanity game server
exports.addListener = function(io) {
    var infNamespace = io.of('/cah');
    infNamespace.on('connection', function(socket) {
        console.log('new CAH connection');
        socket.emit('connected');

        function generateGameCode() {
            var text = '';
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (var i=0; i<4; i++) {
                text += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            return text;
        }

        socket.on('new game', function() {
            var gameCode = generateGameCode();
            console.log('New CAH game with game code = ' + gameCode);
            socket.emit('code created', {
                gameCode: gameCode
            });
        });
    });
};
