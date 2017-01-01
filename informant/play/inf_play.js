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
        alert('Host from room ' + data.gameCode + ' has disconnected');
        window.location.replace('/');
    });

    socket.on('update players', function(data) {
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            if (player.userid.indexOf(socket.id) !== -1) {
                switch (player.color) {
                    case 'blue':
                        $header.css('color', 'white');
                        $header.css('background-color', '#0000FF');
                        $body.css('background-color', '#5555FF');
                        break;
                    case 'yellow':
                        $header.css('color', 'black');
                        $header.css('background-color', '#FFFF00');
                        $body.css('background-color', '#FFFF55');
                        break;
                    case 'orange':
                        $header.css('color', 'black');
                        $header.css('background-color', '#FF8000');
                        $body.css('background-color', '#FFA033');
                        break;
                    case 'green':
                        $header.css('color', 'white');
                        $header.css('background-color', '#00FF00');
                        $body.css('background-color', '#55FF55');
                        break;
                    case 'red':
                        $header.css('color', 'white');
                        $header.css('background-color', '#FF0000');
                        $body.css('background-color', '#FF5555');
                        break;
                    case 'magenta':
                        $header.css('color', 'white');
                        $header.css('background-color', '#FF00FF');
                        $body.css('background-color', '#FF55FF');
                        break;
                    case 'black':
                        $header.css('color', 'white');
                        $header.css('background-color', '#000000');
                        $body.css('background-color', '#555555');
                        break;
                    case 'brown':
                        $header.css('color', 'white');
                        $header.css('background-color', '#906030');
                        $body.css('background-color', '#A08050');
                        break;
                }
            }
        }
    });
});
