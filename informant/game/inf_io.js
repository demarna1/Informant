$(function() {
    var socket = io('/informant');
    var state = null;

    socket.on('connect', function() {
        loadGame(function() {
            socket.emit('new game');
        });
    });

    socket.on('code created', function(data) {
        console.log('new game code = ' + data.gameCode);
        state = new State(data.gameCode);
        update(state);
        playLobbyMusic(true);
    });

    socket.on('user joined', function(data) {
        if (state.players.length < 8) {
            state.addUser(data.userid, data.username);
            update(state);
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
        state.screen = ScreenEnum.LOBBY;
        update(state);
        if (state.players.length > 0) {
            socket.emit('update players', {
                players: state.players
            });
        }
    });

    socket.on('start game', function(data) {
        playLobbyMusic(false);
        animateLobbyPage(function() {
            state.screen = ScreenEnum.BOMB_OVERVIEW;
            update(state);
        });
    });
});
