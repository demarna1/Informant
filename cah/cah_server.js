// Cards Against Humanity game server
exports.games = [];
exports.addListener = function(io) {
    var infNamespace = io.of('/cah');
    infNamespace.on('connection', function(socket) {
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
            exports.games.push(gameCode);
            console.log('Created CAH game room #' + gameCode);
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        socket.on('user joined', function(data) {
            socket.broadcast.emit('user joined', {
                username: data.username
            });
        });
    });
};
