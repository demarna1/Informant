// Root canvas element
var canvas = null;

// Cached state (for resizing events)
var state = null;

// Lobby assets
var lobbyBackground = null;
var lobbyBomb = null;
var scissorsColorOpen = null;
var scissorsFrameOpen = null;

// Load game assets
function loadGame(callback) {
    var queue = new createjs.LoadQueue();
    queue.on('complete', handleComplete, this);
    queue.loadManifest([
        { id: 'lobbyBackground', src: '/img/LobbyBackground.png' },
        { id: 'lobbyBomb', src: '/img/LobbyBomb.png' },
        { id: 'scissorsColorOpen', src: '/img/ScissorsColorOpen.png' },
        { id: 'scissorsFrameOpen', src: '/img/ScissorsFrameOpen.png' }
    ]);

    function handleComplete() {
        // Get image handles and create bitmaps
        lobbyBackground = queue.getResult('lobbyBackground');
        lobbyBomb = queue.getResult('lobbyBomb');
        scissorsColorOpen = queue.getResult('scissorsColorOpen');
        scissorsFrameOpen = queue.getResult('scissorsFrameOpen');

        // Get the canvas and set resize listener
        canvas = document.getElementById('infCanvas');
        state = new State('????');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Notify IO to start the game
        callback();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }
}

// Draw lobby background
function drawLobbyBackground(stage) {
    var lobbybg = new createjs.Bitmap(lobbyBackground);
    var scaleWidth = canvas.width / lobbybg.image.width;
    var scaleHeight = canvas.height / lobbybg.image.height;
    var scale = scaleWidth > scaleHeight ? scaleWidth : scaleHeight;
    lobbybg.scaleX = scale;
    lobbybg.scaleY = scale;
    lobbybg.y = 0;
    lobbybg.x = 0;
    stage.addChild(lobbybg);
}

// Draw lobby title and bomb
function drawLobbyBomb(stage) {
    var lobbybomb = new createjs.Bitmap(lobbyBomb);
    var scale = (0.33 * canvas.width) / lobbybomb.image.width;
    if ((lobbybomb.image.height * scale) / canvas.height > 0.5) {
        scale = (0.5 * canvas.height) / lobbybomb.image.height;
    }
    lobbybomb.scaleX = scale;
    lobbybomb.scaleY = scale;
    lobbybomb.y = 20;
    lobbybomb.x = 40;
    stage.addChild(lobbybomb);
}

// Draw game code text
function drawGameCode(stage, gameCode) {
    var text = new createjs.Text(gameCode, "40px Cambria", "#ff7700");
    text.x = 400;
    text.y = 100;
    text.textBaseline = "alphabetic";
    stage.addChild(text);
}

// Draw scissors
function drawScissors(stage, filter, x, y) {
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
    console.log('drawing gamecode = ' + state.gameCode);
    var stage = new createjs.Stage('infCanvas');
    drawLobbyBackground(stage);
    drawLobbyBomb(stage);
    drawGameCode(stage, state.gameCode);
    for (var i = 0; i < state.players.length; i++) {
        var filter = new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 255, 0);
        drawScissors(stage, filter, 30+100*i, 30);
    }
    stage.update();
}

function update(newState) {
    state = newState;
    draw();
}
