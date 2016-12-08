$(function() {
    // Pages
    var $lobbyPage = $('.lobby.page');
    var $questionPage = $('.question.page');
    var $votePage = $('.vote.page');
    var $resultPage = $('.result.page');
    var $scorePage = $('.score.page');
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
    var $submittedList = $('.submittedList');
    var $voteTimer = $('.voteTimer');
    var $votedList = $('.votedList');
    var $resultBody = $('.resultBody');
    var $scoreGoal = $('.scoreGoal');
    var $scoreBody = $('.scoreBody');
    var $lobbyTitle= $('.lobby.title');

    // State variables
    var socket = io('/cah');
    var state = null;

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

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
        var submittedMap = state.startVoting();
        socket.emit('round over', {
            submissions: submittedMap
        });
        $submittedList.empty();
        $votedList.empty();
        var listToDisplay = [];
        for (var userid in submittedMap) {
            listToDisplay.push(submittedMap[userid]);
        }
        shuffle(listToDisplay);
        for (var i = 0; i < listToDisplay.length; i++) {
            $submittedList.append('<li class="whiteCard"><button class="cardButton">' + listToDisplay[i] + '</button></li>');
        }
        transitionTo($votePage);
        startTimer($voteTimer, 25, $votePage, endVoting);
    }

    function addResultRow(i) {
        r = state.results[i];
        $resultBody.append('<tr id="result' + i + '" style="visibility:hidden;">' +
            '<td class="label">' + state.getUser(r.userid).username + '</td>' +
            '<td><button class="cardButton">' + r.cards + '</button></td>' +
            '<td class="label">' + r.voters.length + '</td>' +
        '</tr>');
        var timeout = (state.results.length - i)*(4000/state.results.length) + 1;
        setTimeout(function() {
            $('#result' + i).css('visibility', 'visible').hide().fadeIn();
        }, timeout);
    }

    function endVoting() {
        socket.emit('voting over');
        $resultBody.empty();
        state.results.sort(function(a, b) {
            return b.voters.length - a.voters.length;
        });
        for (var i = 0; i < state.results.length; i++) {
            addResultRow(i);
        }
        transitionTo($resultPage);
        var timeout = 11000;
        setTimeout(function() {
            if ($currentPage == $resultPage) {
                endResults();
            }
        }, timeout);
    }

    function addScoreRow(i) {
        r = state.players[i];
        $scoreBody.append('<tr id="score' + i + '" style="visibility:hidden;">' +
            '<td class="label">' + state.getUser(r.userid).username + '</td>' +
            '<td class="label">' + r.score + '</td>' +
        '</tr>');
        timeout = (state.players.length - i)*(4000/state.results.length) + 1;
        setTimeout(function() {
            $('#score' + i).css('visibility', 'visible').hide().fadeIn();
        }, timeout);
    }

    function endResults() {
        $scoreBody.empty();
        state.players.sort(function(a, b) {
            return b.score - a.score;
        });
        for (var i = 0; i < state.players.length; i++) {
            addScoreRow(i);
        }
        transitionTo($scorePage);
        var timeout = 11000;
        setTimeout(function() {
            if ($currentPage == $scorePage) {
                if (state.isGameOver()) {
                    endGame();
                } else {
                    socket.emit('start round');
                }
            }
        }, timeout);
    }

    function endGame() {
        var winner = state.players[0].username;
        $lobbyTitle.text('Congratulations, ' + winner + '!');
        transitionTo($lobbyPage);
        socket.emit('game over', {
            winner: winner
        });
    }

    $tradButton.click(function() {
        state.winningScore = 5 * state.players.length;
        $scoreGoal.text(state.winningScore);
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
            $lobbyTitle.text('Cards Against Humanity');
            transitionTo($lobbyPage);
            socket.emit('game over', { });
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
            endRound();
        }
    });

    socket.on('user voted', function(data) {
        state.addUserVote(data.userid, data.cardText, data.done);
        if (data.done) {
            $votedList.append('<li class="answeredPlayer">' +
                state.getUser(data.userid).username + '</li>');
        }
        if (state.isVotingOver()) {
            endVoting();
        }
    });
});
