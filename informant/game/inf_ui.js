function loadGame() {
    var lobbyBackground = null;
    var lobbyBomb = null;
    var canvas = document.getElementById('infCanvas');

    var queue = new createjs.LoadQueue();
    queue.on('complete', handleComplete, this);
    queue.loadManifest([
        { id: 'lobbyBackground', src: '/LobbyBackground.png' },
        { id: 'lobbyBomb', src: '/LobbyBomb.png' }
    ]);

    function handleComplete() {
        lobbyBackground = queue.getResult('lobbyBackground');
        lobbyBomb = queue.getResult('lobbyBomb');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }

    function draw() {
        var stage = new createjs.Stage('infCanvas');

        // Draw lobby background
        var lobbybg = new createjs.Bitmap(lobbyBackground);
        var scaleWidth = canvas.width / lobbybg.image.width;
        var scaleHeight = canvas.height / lobbybg.image.height;
        var scale = scaleWidth > scaleHeight ? scaleWidth : scaleHeight;
        lobbybg.scaleX = scale;
        lobbybg.scaleY = scale;
        lobbybg.y = 0;
        lobbybg.x = 0;
        stage.addChild(lobbybg);

        // Draw lobby title and bomb
        var lobbybomb = new createjs.Bitmap(lobbyBomb);
        lobbybomb.scaleX = 0.15;
        lobbybomb.scaleY = 0.15;
        lobbybomb.y = 40;
        lobbybomb.x = 40;
        stage.addChild(lobbybomb);

        stage.update();
    }
}
