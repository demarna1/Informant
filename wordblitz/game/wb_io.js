$(function() {
    var socket = io('/wordblitz');
    var state = new State();

    socket.on('connect', function() {
        loadGame(state, function() {
            socket.emit('new game');
        });
    });

    socket.on('code created', function(data) {
        console.log('new game code = ' + data.gameCode);
        state.gameCode = data.gameCode;
        update();
    });

    socket.on('user joined', function(data) {
        if (state.players.length < 4) {
            state.addUser(data.userid, data.username);
            update();
            socket.emit('update players', {
                players: state.players
            });
        } else {
            socket.emit('lobby full', {
                userid: data.userid
            });
        }
    });

    socket.on('user left', function(data) {
        state.removeUser(data.userid);
        update();
        if (state.players.length > 0) {
            socket.emit('update players', {
                players: state.players
            });
        }
    });

    socket.on('start game', function(data) {
        console.log('starting game with word: ' + data.word);
        animateRoundPage(function() {
            state.startGame(data.word, data.matches);
            update();
            socket.emit('start round', {
                word: data.word,
                matches: data.matches
            });
        });
    });
});
