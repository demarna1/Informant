$(function() {
    // Other jQuery elements
    var $welcomeLabel = $('.welcomeLabel .label');
    var $waitingLabel = $('.waitingLabel .label');

    // State variables
    var socket = io('/cah');
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
        socket.emit('user joined', {
            gameCode: getUrlParameter('gameCode'),
            username: username
        });
        $welcomeLabel.text('Welcome, ' + username + '!');
        $waitingLabel.text('Waiting to start a new game...');
    });
});
