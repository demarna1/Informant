$(function() {
    $('#gameCode').focus(function() {
        $('#gameCode').val('');
    });
    $('#name').focus(function() {
        $('#name').val('');
    });
    $('#joinButton').click(function() {
        var gameCode = $('#gameCode').val();
        var name = $('#name').val();
        if (gameCode.length != 4) {
            alert('Please enter 4-letter game code');
        } else if (name.length == 0) {
            alert('Please enter your name');
        } else {
            data = { gameCode: gameCode, name: name };
            $.get('/play', data, function(res) {
                if (res.status == 'success') {
                    alert('Joined successfully');
                } else if (res.status == 'error') {
                    alert('Invalid room code: ' + gameCode);
                } else {
                    alert('Unknown response from server');
                }
            });
        }
    });
});
