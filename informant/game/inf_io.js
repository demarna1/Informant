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
        playLobbyMusic();
    });

    socket.on('user joined', function(data) {
        state.addUser(data.userid, data.username);
        update(state);
        playJoinSound(data.userid);
    });

    socket.on('user left', function(data) {
        state.removeUser(data.userid);
        update(state);
    });
});
