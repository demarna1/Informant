$(function() {
    var socket = io('/espy');
    var state = new State();

    socket.on('connect', function() {
        loadGame(state, function() {
            socket.emit('new game');
        });
    });
});
