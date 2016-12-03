// Cards Against Humanity game server
exports.rooms = {};

exports.addListener = function(io) {
    var db = require('./db/db.js');
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

        // The host wants to create a new game
        socket.on('new game', function() {
            addedGame = true;
            var gameCode = generateGameCode();
            exports.rooms[gameCode] = socket.id;
            db.setup(gameCode);
            socket.join(gameCode);
            socket.gameCode = gameCode;
            console.log('CAH game host ' + gameCode + ' created');
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
                console.log('CAH player ' + data.username + ' joined ' + gameCode);
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
                console.log('CAH player left room');
                socket.broadcast.to(socket.gameid).emit('user left', {
                    userid: socket.id
                });
                addedUser = false;
            }
            if (addedGame) {
                delete exports.rooms[socket.gameCode];
                db.cleanup(socket.gameCode);
                console.log('CAH game host ' + socket.gameCode + ' disconnected');
                socket.broadcast.to(socket.gameCode).emit('host left', {
                    gameCode: socket.gameCode
                });
                addedGame = false;
            }
        });

        // The host has started the game
        socket.on('start round', function(data) {
            var blackCard = db.blackCard(socket.gameCode);
            var pick = (blackCard.match(/_/g) || []).length;
            if (pick == 0) pick = 1;
            socket.emit('black card', {
                text: blackCard,
                pick: pick
            });
            socket.broadcast.to(socket.gameCode).emit('new round', {
                pick: pick
            });
        });

        // The player has requested some cards
        socket.on('card request', function(data) {
            var whiteCards = db.whiteCards(socket.gameCode, data.numCards);
            socket.emit('white cards', {
                whiteCards: whiteCards
            });
        });

        // The client has submitted an answer card
        socket.on('answer card', function(data) {
            socket.broadcast.to(socket.gameid).emit('user answered', {
                userid: socket.id,
                cardText: data.cardText,
                done: data.done
            });
        });
    });
};
