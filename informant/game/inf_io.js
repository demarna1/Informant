$(function() {
    var socket = io('/informant');
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
        //playLobbyMusic(true);
    });

    socket.on('user joined', function(data) {
        if (state.players.length < 8) {
            state.addUser(data.userid, data.username);
            update();
            playJoinSound(data.userid);
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
        //playLobbyMusic(false);
        animateLobbyPage(function() {
            state.startGame();
            update();
            socket.emit('assign roles', {
            });
        });
    });
});
