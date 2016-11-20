$(function() {
    // Other jQuery elements
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');

    // State variables
    var socket = io('/cah');
    var state = null;

    function updateLobby() {
        $lobbyList.empty();
        for (var i = 0; i < state.players.length; i++) {
            $lobbyList.append('<li class="lobbyPlayer">' + state.players[i].username + '</li>');
        }
        if (state.players.length >= 2) {
            $readyLabel.text('All players ready?');
            $startButton.removeAttr('disabled');
        } else {
            $readyLabel.text('Need ' + (2 - state.players.length) + ' more player(s).');
            $startButton.attr('disabled', 'disabled');
        }
    }

    socket.on('connected', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        state = new State(data.gameCode);
        $gameCode.text(state.gameCode);
        $lobbyList.empty();
    });

    socket.on('user joined', function(data) {
        state.addUser(data.username);
        console.log(data.username + ' joined, numPlayers = ' + state.players.length);
        updateLobby();
    });
});
