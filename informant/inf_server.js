// Informant game server
exports.rooms = {};

exports.addListener = function(io) {
    var namespace = io.of('/informant');
    namespace.on('connection', function(socket) {
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
            exports.rooms[gameCode] = socket.id;
            socket.join(gameCode);
            socket.gameCode = gameCode;
            console.log('INF game host ' + gameCode + ' created');
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        socket.on('disconnect', function(data) {
            if (addedGame) {
                delete exports.rooms[socket.gameCode];
                console.log('INF game host ' + socket.gameCode + ' disconnected');
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
                addedGame = false;
            }
        });
    });
};
