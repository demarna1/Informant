// Cards Against Humanity game server
exports.rooms = {};

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
            exports.rooms[gameCode] = {
                gameid: socket.id
            };
            socket.join(gameCode);
            console.log('created CAH game room #' + gameCode +
                ' with id = ' + socket.id);
            socket.gameCode = gameCode;
            socket.emit('code created', {
                gameCode: gameCode
            });
        });

        socket.on('new user', function(data) {
            var gameCode = data.gameCode;
            if (!(gameCode in exports.rooms)) {
                socket.emit('host left', {
                    gameCode: gameCode
                });
            } else {
                addedUser = true;
                socket.join(gameCode);
                console.log(data.username + ' joined with id ' +
                    socket.id);
                var gameid = exports.rooms[gameCode].gameid;
                socket.gameid = gameid;
                socket.broadcast.to(gameid).emit('user joined', {
                    username: data.username,
                    userid: socket.id
                });
            }
        });

        socket.on('disconnect', function(data) {
            if (addedUser) {
                console.log('user ' + socket.id + ' left room');
                socket.broadcast.to(socket.gameid).emit('user left', {
                    userid: socket.id
                });
                addedUser = false;
            }
            if (addedGame) {
                /* TODO: remove from exports */
                console.log('game host with code = ? has disconnected');
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
                addedGame = false;
            }
        });
    });
};
