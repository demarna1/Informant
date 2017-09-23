// Espy game server
exports.rooms = {};

exports.addListener = function(io) {
    var namespace = io.of('/espy');
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
            console.log('Espy game host ' + gameCode + ' created');
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
                console.log('Espy player ' + data.username + ' joined ' + gameCode);
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
                console.log('Espy player left room');
                socket.broadcast.to(socket.gameid).emit('user left', {
                    userid: socket.id;
                });
            } else {
                console.log('Espy game host ' + socket.gameCode + ' disconnected');
                delete exports.rooms[socket.gameCode];
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode;
                });
            }
        });
    });
};
