$(function() {
    // Pages
    var $waitPage = $('.wait.page');
    var $cardPage = $('.card.page');
    var $votePage = $('.vote.page');
    var $currentPage = $waitPage;

    // Other jQuery elements
    var $welcomeLabel = $('.welcomeLabel .label');
    var $waitingLabel = $('.waitingLabel .label');
    var $cardList = $('.cardList');
    var $voteList = $('.voteList');

    // State variables
    var socket = io('/cah');
    var username = '';
    var cardsToAnswer = 0;

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1));
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

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
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function registerClicks(message) {
        $('.cardButton').click(function() {
            if ($(this).attr('class') != 'cardButton' ||
                cardsToAnswer <= 0) {
                return;
            }
            var done = (--cardsToAnswer == 0);
            $(this).attr('class', 'cardButtonSelected');
            socket.emit(message, {
                cardText: $(this).text(),
                done: done
            });
            if (done) {
                $welcomeLabel.text('Response submitted!');
                $waitingLabel.text('Waiting for other players...');
                transitionTo($waitPage);
            }
        });
    }

    socket.on('connect', function() {
        username = getUrlParameter('name');
        socket.emit('new user', {
            gameCode: getUrlParameter('gameCode'),
            username: username
        });
        $welcomeLabel.text('Welcome, ' + username + '!');
        $waitingLabel.text('Waiting to start a new game...');
    });

    socket.on('host left', function(data) {
        alert('Host from room ' + data.gameCode + ' has disconnected');
        window.location.replace('/');
    });

    socket.on('new round', function(data) {
        cardsToAnswer = data.pick;
        $('.cardButtonSelected').parent().remove();
        var cardsToRequest = 10 - $('.cardList li').length;
        socket.emit('card request', {
            numCards: cardsToRequest
        });
        transitionTo($cardPage);
    });

    socket.on('white cards', function(data) {
        for (var i = 0; i < data.whiteCards.length; i++) {
            $cardList.append('<li class="whiteCard"><button class="cardButton">' + data.whiteCards[i] + '</button></li>');
        }
        registerClicks('answer card');
    });

    socket.on('round over', function(data) {
        $voteList.empty();
        var cardsForVoting = [];
        for (var userid in data.submissions) {
            if (userid.split('#')[1] != socket.id) {
                cardsForVoting.push(data.submissions[userid]);
            }
        }
        shuffle(cardsForVoting);
        for (var i = 0; i < cardsForVoting.length; i++) {
            $voteList.append('<li class="whiteCard"><button class="cardButton">' + cardsForVoting[i] + '</button></li>');
        }
        cardsToAnswer = 1;
        registerClicks('vote card');
        transitionTo($votePage);
    });

    socket.on('voting over', function() {
        cardsToAnswer = 0;
        $welcomeLabel.text('The votes are in!');
        $waitingLabel.text('Waiting to start a new round...');
        transitionTo($waitPage);
    });

    socket.on('game over', function(data) {
        cardsToAnswer = 0;
        $cardList.empty();
        if (data.winner) {
            $welcomeLabel.text(data.winner + ' is the winner!');
        } else {
            $welcomeLabel.text('Game ended due to lack of players');
        }
        $waitingLabel.text('Waiting to start a new game...');
        transitionTo($waitPage);
    });
});
