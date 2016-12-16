$(function() {
    var socket = io('/informant');
    loadGame();

    socket.on('connect', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        console.log('new game code = ' + data.gameCode);
    });

    socket.on('user joined', function(data) {
        console.log('new user name = ' + data.username);
    });

    socket.on('user left', function(data) {
        console.log('user left');
    });
});
