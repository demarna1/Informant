$(function() {
    $('#gameCode').focus(function() {
        $('#gameCode').val('');
    });
    $('#name').focus(function() {
        $('#name').val('');
    });
    $('#joinButton').click(function() {
        var gameCode = $('#gameCode').val().toUpperCase();
        var name = $('#name').val();
        if (gameCode.length != 4) {
            alert('Please enter 4-letter game code');
        } else if (name.length == 0) {
            alert('Please enter your name');
        } else {
            data = { gameCode: gameCode, name: name };
            $.get('/play', data, function(res) {
                if (res.result == 'success') {
                    var url = res.url + '?gameCode=' +
                        gameCode + '&name=' + name;
                    location.href = url;
                } else {
                    alert('Invalid room code: ' + gameCode);
                }
            });
        }
    });
});
