$(function() {
    // Other jQuery elements
    var $header = $('.header');
    var $body = $('body');
    var $masterContainer = $('.master-container');
    var $masterButton = $('.master-button');

    // State variables
    var socket = io('/wordblitz');
    var username = '';

    // Colors
    var colorGamut = {
        'skyblue': { 'text': 'white', 'primary': '#0f2baa', 'secondary': '#3f5bda' },
        'lime': { 'text': 'black', 'primary': '#ffff00', 'secondary': '#404040' },
        'orange': { 'text': 'black', 'primary': '#ff8800', 'secondary': '#faa443' },
        'pink': { 'text': 'white', 'primary': '#e81010', 'secondary': '#f25757' }
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

    $masterButton.click(function() {
        socket.emit('start game');
    });

    socket.on('connect', function() {
        username = getUrlParameter('name');
        socket.emit('new user', {
            gameCode: getUrlParameter('gameCode'),
            username: username
        });
        $header.text('Welcome, ' + username + '!');
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
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            if (player.userid.indexOf(socket.id) !== -1) {
                $header.css('color', colorGamut[player.color]['text']);
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
});
