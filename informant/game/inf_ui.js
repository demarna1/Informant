function Game(gameCode) {
    this.gameCode = gameCode;
    this.players = [];

    loadGame();
}

Game.prototype.addUser = function(userid, username) {
    this.players.push({
        userid: userid,
        username: username
    });
    //draw();
};

function loadGame() {
    var lobbyBackground = null;
    var lobbyBomb = null;
    var scissorsColorOpen = null;
    var scissorsFrameOpen = null;
    var canvas = document.getElementById('infCanvas');

    var queue = new createjs.LoadQueue();
    queue.on('complete', handleComplete, this);
    queue.loadManifest([
        { id: 'lobbyBackground', src: '/img/LobbyBackground.png' },
        { id: 'lobbyBomb', src: '/img/LobbyBomb.png' },
        { id: 'scissorsColorOpen', src: '/img/ScissorsColorOpen.png' },
        { id: 'scissorsFrameOpen', src: '/img/ScissorsFrameOpen.png' }
    ]);

    function handleComplete() {
        lobbyBackground = queue.getResult('lobbyBackground');
        lobbyBomb = queue.getResult('lobbyBomb');
        scissorsColorOpen = queue.getResult('scissorsColorOpen');
        scissorsFrameOpen = queue.getResult('scissorsFrameOpen');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }

    function drawScissors(stage, filter, x, y) {
        // Draw scissors
        var scissors = new createjs.Bitmap(scissorsColorOpen);
        scissors.filters = [ filter ];
        scissors.cache(0, 0, scissors.getBounds().width, scissors.getBounds().height);
        scissors.scaleX = 0.2;
        scissors.scaleY = 0.2;
        scissors.y = y;
        scissors.x = x;
        stage.addChild(scissors);

        var frame = new createjs.Bitmap(scissorsFrameOpen);
        frame.scaleX = 0.2;
        frame.scaleY = 0.2;
        frame.y = y;
        frame.x = x;
        stage.addChild(frame);
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

        //for (var i = 0; i < this.players.length; i++) {
            //var filter = new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 255, 0);
            //drawScissors(stage, filter, 30+100*i, 30);
        //}

        stage.update();
    }
}
