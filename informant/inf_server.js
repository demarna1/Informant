// Informant game server
exports.rooms = {};

exports.addListener = function(io) {
    var namespace = io.of('/informant');
    namespace.on('connection', function(socket) {
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

        // The host wants to create a new game
        socket.on('new game', function() {
            addedGame = true;
            var gameCode = generateGameCode();
            exports.rooms[gameCode] = socket.id;
            socket.join(gameCode);
            socket.gameCode = gameCode;
            console.log('INF game host ' + gameCode + ' created');
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        // The player wants to join a room
        socket.on('new user', function(data) {
            var gameCode = data.gameCode;
            if (!(gameCode in exports.rooms)) {
                socket.emit('host left', {
                    gameCode: gameCode
                });
            } else {
                addedUser = true;
                socket.join(gameCode);
                console.log('INF player ' + data.username + ' joined ' + gameCode);
                socket.gameCode = gameCode;
                var gameid = exports.rooms[gameCode];
                socket.gameid = gameid;
                socket.broadcast.to(gameid).emit('user joined', {
                    username: data.username,
                    userid: socket.id
                });
            }
        });

        // The host or player has disconnected
        socket.on('disconnect', function(data) {
            if (addedUser) {
                console.log('INF player left room');
                socket.broadcast.to(socket.gameid).emit('user left', {
                    userid: socket.id
                });
                addedUser = false;
            }
            if (addedGame) {
                delete exports.rooms[socket.gameCode];
                console.log('INF game host ' + socket.gameCode + ' disconnected');
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
                addedGame = false;
            }
        });

        // The host updated the player manifest
        socket.on('update players', function(data) {
            socket.broadcast.to(socket.gameCode).emit('update players', {
                enabled: data.enabled
            });
        });
    });
};
