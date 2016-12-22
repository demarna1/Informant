$(function() {
    var socket = io('/informant');
    var game = null;

    socket.on('connect', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        console.log('new game code = ' + data.gameCode);
        game = new Game(data.gameCode);
    });

    socket.on('user joined', function(data) {
        game.addUser(data.username);
    });

    socket.on('user left', function(data) {
        game.removeUser(data.username);
    });
});
