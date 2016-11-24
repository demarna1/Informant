// Cards Against Humanity game server
exports.games = [];
exports.addListener = function(io) {
    var infNamespace = io.of('/cah');
    infNamespace.on('connection', function(socket) {
        var addedUser = false;
        var addedGame = false;

        function generateGameCode() {
            var text = '';
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (var i=0; i<4; i++) {
                text += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            return text;
        }

        socket.on('new game', function() {
            addedGame = true;
            var gameCode = generateGameCode();
            exports.games.push(gameCode);
            /* TODO: Add game to room */
            console.log('Created CAH game room #' + gameCode);
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        socket.on('user joined', function(data) {
            addedUser = true;
            /* TODO: Add user to room */
            socket.username = data.username;
            socket.broadcast.emit('user joined', {
                username: data.username
            });
        });

        socket.on('disconnect', function(data) {
            if (addedUser) {
                console.log(socket.username + ' left room');
                socket.broadcast.emit('user left', {
                    username: socket.username
                });
            }
            if (addedGame) {
                console.log('Game host with code = ? has disconnected');
                socket.broadcast.emit('host left', {
                    gameCode: '?'
                });
                addedGame = false;
            }
        });
    });
};
