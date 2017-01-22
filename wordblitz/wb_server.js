// Word Blitz game server
exports.rooms = {};

exports.addListener = function(io) {
    var namespace = io.of('/wordblitz');
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
            console.log('WB game host ' + gameCode + ' created');
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        // The player wants to join a room
        socket.on('new user', function(data) {

        });

        // The host or player has disconnected
        socket.on('disconnect', function() {
            if (socket.user) {

            } else {
                console.log('WB game host ' + socket.gameCode + ' disconnected');
                delete exports.rooms[socket.gameCode];
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
            }
        });
    });
};
