$(function() {
    // Other jQuery elements
    var $lobbyList = $('.lobbyList');
    var $gameCode = $('.code');

    // State variables
    var socket = io('/cah');
    var state = null;

    socket.on('connected', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        state = new State(data.gameCode);
        $gameCode.text(state.gameCode);
        $lobbyList.empty();
    });
});
