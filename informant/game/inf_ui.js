function loadGame() {
    var lobbyBackground = null;
    var canvas = document.getElementById('infCanvas');

    var queue = new createjs.LoadQueue();
    queue.on('complete', handleComplete, this);
    queue.loadManifest([
        { id: 'lobbyBackground', src: '/InformantLobby.png' }
    ]);

    function handleComplete() {
        lobbyBackground = queue.getResult('lobbyBackground');
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
        console.log('scale = ' + scale);
        lobbybg.scaleX = scale;
        lobbybg.scaleY = scale;
        lobbybg.y = 0;
        lobbybg.x = 0;
        stage.addChild(lobbybg);

        stage.update();
    }
}
