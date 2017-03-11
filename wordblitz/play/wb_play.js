$(function() {
    // Pages
    var $waitPage = $('.waitPage');
    var $readyPage = $('.readyPage');
    var $solvePage = $('.solvePage');
    var $currentPage = $waitPage;

    // Other jQuery elements
    var $body = $('body');
    var $header = $('.header');
    var $welcomeHeader = $('.welcome.header');
    var $masterContainer = $('.master-container');
    var $masterButton = $('.master-button');
    var $countdown = $('.countdown');

    // State variables
    var socket = io('/wordblitz');
    var username = '';

    // Colors
    var colorGamut = {
        'skyblue': { 'primary': '#55aaff', 'secondary': '#bbddff' },
        'lime': { 'primary': '#77cc66', 'secondary': '#ccffbb' },
        'orange': { 'primary': '#eeaa22', 'secondary': '#ffdd88' },
        'pink': { 'primary': '#ee7777', 'secondary': '#ffbbbb' }
    };

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

    function transitionTo($nextPage) {
        if ($currentPage !== $nextPage) {
            $currentPage.fadeOut();
            $nextPage.delay(400).fadeIn();
            $currentPage = $nextPage;
        }
    }

    function roundCountdown() {
        transitionTo($readyPage);
        if (typeof roundCountdown.currentId == 'undefined') {
            roundCountdown.currentId = 0;
        }
        if (roundCountdown.currentId > 0) {
            clearInterval(roundCountdown.currentId);
            roundCountdown.currentId = 0;
        }
        var timeLeft = 5;
        $countdown.text(timeLeft);
        roundCountdown.currentId = setInterval(function() {
            if (--timeLeft <= 0) {
                clearInterval(roundCountdown.currentId);
                roundCountdown.currentId = 0;
            }
            $countdown.text(timeLeft);
        }, 1000);
    }

    $masterButton.click(function() {
        socket.emit('start game');
        $masterContainer.hide();
        roundCountdown();
    });

    socket.on('connect', function() {
        username = getUrlParameter('name');
        socket.emit('new user', {
            gameCode: getUrlParameter('gameCode'),
            username: username
        });
        $welcomeHeader.text('Welcome, ' + username + '!');
    });

    socket.on('host left', function(data) {
        alert('Word Blitz room ' + data.gameCode + ' has disconnected');
        window.location.replace('/');
    });

    socket.on('lobby full', function(data) {
        alert('Word Blitz room ' + data.gameCode + ' is full');
        window.location.replace('/');
    });

    socket.on('update players', function(data) {
        if (data.players.length < 2) {
            transitionTo($waitPage);
        }
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            if (player.userid.indexOf(socket.id) !== -1) {
                $header.css('color', 'white');
                $header.css('background-color', colorGamut[player.color]['primary']);
                $body.css('background-color', colorGamut[player.color]['secondary']);
                if (player.gameMaster) {
                    $masterContainer.show();
                } else {
                    $masterContainer.hide();
                }
                $masterButton.prop('disabled', data.players.length < 2);
            }
        }
    });

    socket.on('round countdown', function() {
        roundCountdown();
    });

    socket.on('start round', function(data) {
        console.log('round word: ' + data.word);
        transitionTo($solvePage);
    });
});
