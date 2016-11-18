$(function() {
    // State variables
    var socket = io('/cah');

    socket.on('connected', function() {
        socket.emit('user joined', {
            username: 'NoahTest'
        });
    });
});
