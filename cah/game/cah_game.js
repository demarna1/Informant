$(function() {
    // Pages
    var $lobbyPage = $('.lobby.page');
    var $currentPage = $lobbyPage;

    // Other jQuery elements
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');

    // State variables
    var socket = io('/cah');
    var state = null;

    function transitionTo($nextPage) {
        if ($currentPage == $nextPage) return;
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

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

    socket.on('connect', function() {
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        state = new State(data.gameCode);
        $gameCode.text(state.gameCode);
        $lobbyList.empty();
    });

    socket.on('user joined', function(data) {
        state.addUser(data.userid, data.username);
        console.log(data.username + ' joined, numPlayers = ' + state.players.length);
        updateLobby();
    });

    socket.on('user left', function(data) {
        state.removeUser(data.userid);
        console.log('player left, numPlayers = ' + state.players.length);
        updateLobby();
        if (state.players.length < 2) {
            state.restart();
            transitionTo($lobbyPage);
        }
    });
});
