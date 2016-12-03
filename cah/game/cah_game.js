$(function() {
    // Pages
    var $lobbyPage = $('.lobby.page');
    var $questionPage = $('.question.page');
    var $currentPage = $lobbyPage;

    // Other jQuery elements
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $tradButton = $('.tradButton .button');
    var $koButton = $('.koButton .button');
    var $questionRound = $('.question.page .title');
    var $questionLabel = $('.questionLabel .label');
    var $answeredList = $('.answeredList');
    var $roundTimer = $('.roundTimer');

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
            $tradButton.removeAttr('disabled');
            //$koButton.removeAttr('disabled'); // TODO - implement knockout
        } else {
            $readyLabel.text('Need ' + (2 - state.players.length) + ' more player(s).');
            $tradButton.attr('disabled', 'disabled');
            $koButton.attr('disabled', 'disabled');
        }
    }

    function startTimer($timer, duration, $triggerPage, triggerCallback) {
        if (typeof startTimer.currentId == 'undefined') {
            startTimer.currentId = 0;
        }
        if (startTimer.currentId > 0) {
            clearInterval(startTimer.currentId);
            startTimer.currentId = 0;
        }
        var timeLeft = duration;
        $timer.text(timeLeft);
        startTimer.currentId = setInterval(function() {
            if (--timeLeft < 0) {
                clearInterval(startTimer.currentId);
                startTimer.currentId = 0;
                if ($currentPage == $triggerPage) {
                    triggerCallback();
                }
                return;
            }
            $timer.text(timeLeft);
        }, 1000);
    }

    function endRound() {
        console.log('round over; start voting');
    }

    $tradButton.click(function() {
        state.winningScore = 5 * state.players.length;
        socket.emit('start round');
    });

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

    socket.on('black card', function(data) {
        state.newRound();
        $questionRound.text('Round ' + state.round);
        $questionLabel.text(data.text);
        $answeredList.empty();
        transitionTo($questionPage);
        startTimer($roundTimer, 20 + 10*data.pick, $questionPage, endRound);
    });

    socket.on('user answered', function(data) {
        state.addUserAnswer(data.userid, data.cardText, data.done);
        if (data.done) {
            $answeredList.append('<li class="answeredPlayer">' +
                state.getUser(data.userid).username + '</li>');
        }
        if (state.isRoundOver()) {
            console.log('Round is over');
        }
    });
});
