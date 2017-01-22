$(function() {
    var socket = io('/wordblitz');
    var state = null;

    socket.on('connect', function() {
        loadGame(function() {
            socket.emit('new game');
        });
    });

    socket.on('code created', function(data) {
        console.log('new game code = ' + data.gameCode);
    });
});
