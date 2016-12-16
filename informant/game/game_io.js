$(function() {
    var socket = io('/informant');
    loadGame();

    socket.on('connect', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        console.log('new game code ' + data.gameCode);
    });
});
