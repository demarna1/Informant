$(function() {
    // Other jQuery elements
    var $header = $('.header');
    var $body = $('body');

    // State variables
    var socket = io('/informant');
    var username = '';

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

    socket.on('connect', function() {
        username = getUrlParameter('name');
        socket.emit('new user', {
            gameCode: getUrlParameter('gameCode'),
            username: username
        });
        $header.text('Welcome, ' + username + '!');
    });

    socket.on('host left', function(data) {
        alert('Informant room ' + data.gameCode + ' has disconnected');
        window.location.replace('/');
    });

    socket.on('lobby full', function(data) {
        alert('Informant room ' + data.gameCode + ' is full');
        window.location.replace('/');
    });

    socket.on('update players', function(data) {
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            if (player.userid.indexOf(socket.id) !== -1) {
                switch (player.color) {
                    case 'blue':
                        $header.css('color', 'white');
                        $header.css('background-color', '#0f2baa');
                        $body.css('background-color', '#3f5bda');
                        break;
                    case 'yellow':
                        $header.css('color', 'black');
                        $header.css('background-color', '#ffff00');
                        $body.css('background-color', '#ffff80');
                        break;
                    case 'orange':
                        $header.css('color', 'black');
                        $header.css('background-color', '#ff8800');
                        $body.css('background-color', '#faa443');
                        break;
                    case 'green':
                        $header.css('color', 'white');
                        $header.css('background-color', '#14a30d');
                        $body.css('background-color', '#44d33d');
                        break;
                    case 'red':
                        $header.css('color', 'white');
                        $header.css('background-color', '#e81010');
                        $body.css('background-color', '#f25757');
                        break;
                    case 'purple':
                        $header.css('color', 'white');
                        $header.css('background-color', '#c018c0');
                        $body.css('background-color', '#e850e8');
                        break;
                    case 'black':
                        $header.css('color', 'white');
                        $header.css('background-color', '#101010');
                        $body.css('background-color', '#404040');
                        break;
                    case 'brown':
                        $header.css('color', 'white');
                        $header.css('background-color', '#805020');
                        $body.css('background-color', '#a08050');
                        break;
                }
            }
        }
    });
});
