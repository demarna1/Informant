// Informant game server
exports.rooms = {};

exports.addListener = function(io) {
    var namespace = io.of('/informant');
    namespace.on('connection', function(socket) {

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
            var gameCode = generateGameCode();
            exports.rooms[gameCode] = socket.id;
            socket.join(gameCode);
            socket.gameCode = gameCode;
            socket.user = false;
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
                socket.join(gameCode);
                socket.gameCode = gameCode;
                socket.user = true;
                console.log('INF player ' + data.username + ' joined ' + gameCode);
                var gameid = exports.rooms[gameCode];
                socket.gameid = gameid;
                socket.broadcast.to(gameid).emit('user joined', {
                    username: data.username,
                    userid: socket.id
                });
            }
        });

        // The host or player has disconnected
        socket.on('disconnect', function() {
            if (socket.user) {
                console.log('INF player left room');
                socket.broadcast.to(socket.gameid).emit('user left', {
                    userid: socket.id
                });
            } else {
                console.log('INF game host ' + socket.gameCode + ' disconnected');
                delete exports.rooms[socket.gameCode];
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
            }
        });

        // The player was rejected because the room was full
        socket.on('lobby full', function(data) {
            socket.broadcast.to(data.userid).emit('lobby full', {
                gameCode: socket.gameCode
            });
        });

        // The host updated the player manifest
        socket.on('update players', function(data) {
            socket.broadcast.to(socket.gameCode).emit('update players', {
                players: data.players
            });
        });

        // The players have started the game
        socket.on('start game', function() {
            socket.broadcast.to(socket.gameid).emit('start game');
        });
    });
};
