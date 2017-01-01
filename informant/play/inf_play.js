$(function() {
    // Other jQuery elements
    var $headerCenter = $('.headerCenter');

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
        $headerCenter.text('Welcome, ' + username + '!');
    });

    socket.on('host left', function(data) {
        alert('Host from room ' + data.gameCode + ' has disconnected');
        window.location.replace('/');
    });

    socket.on('update players', function(data) {
        console.log('got update');
    });
});
