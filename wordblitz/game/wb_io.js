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
        //playLobbyMusic(true);
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
        //playLobbyMusic(false);
        console.log('new game with word = ' + data.word);
        console.log('matches = ' + data.matches);
        //animateLobbyPage(function() {
            state.startGame(data.word, data.matches);
            update();
            //socket.emit('new round', {
                //letters: state.letters
            //});
        //});
    });
});
