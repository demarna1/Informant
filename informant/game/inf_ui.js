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

function drawLobbyBackground(stage) {
    var lobbybg = new createjs.Bitmap(lobbyBackground);
    var scaleWidth = canvas.width / lobbybg.image.width;
    var scaleHeight = canvas.height / lobbybg.image.height;
    var scale = Math.max(scaleWidth, scaleHeight);
    lobbybg.scaleX = scale;
    lobbybg.scaleY = scale;
    lobbybg.x = 0;
    lobbybg.y = 0;
    stage.addChild(lobbybg);
}

function drawLobbyBomb(stage) {
    var lobbybomb = new createjs.Bitmap(lobbyBomb);
    var scale = (0.33 * canvas.width) / lobbybomb.image.width;
    if ((lobbybomb.image.height * scale) / canvas.height > 0.5) {
        scale = (0.5 * canvas.height) / lobbybomb.image.height;
    }
    lobbybomb.scaleX = scale;
    lobbybomb.scaleY = scale;
    lobbybomb.x = 40;
    lobbybomb.y = 20;
    stage.addChild(lobbybomb);
}

function drawGameCode(stage) {
    var text = new createjs.Text(state.gameCode, '40px Cambria', '#ff7700');
    text.x = 400;
    text.y = 100;
    text.textBaseline = 'alphabetic';
    stage.addChild(text);
}

function drawScissors(/*stage, filter, x, y*/) {
    /*
    var scissors = new createjs.Bitmap(scissorsColorOpen);
    scissors.filters = [ filter ];
    scissors.cache(0, 0, scissors.getBounds().width, scissors.getBounds().height);
    scissors.scaleX = 0.2;
    scissors.scaleY = 0.2;
    scissors.x = x;
    scissors.y = y;
    stage.addChild(scissors);
    */

    var frame = new createjs.Bitmap(scissorsFrameOpen);
    frame.scaleX = 0.05;
    frame.scaleY = 0.05;
    /*frame.x = x;
    frame.y = y;
    stage.addChild(frame);*/
    return frame;
}

function editPlayerBubble(bubble, radius, player) {
    var s = radius / Math.sqrt(2);
    var playerText = new createjs.Text(player.username, '26px Cambria', '#000000');
    var bounds = playerText.getBounds();
    playerText.x = -bounds.width/2;
    playerText.y = s - bounds.height;
    bubble.addChild(playerText);
}

function drawBubbles(stage) {
    var padding = Math.floor(canvas.width/(Math.max(4, state.players.length+1)*6));
    var blockWidth = (canvas.width - 2*padding)/Math.max(4, state.players.length+1);
    var radius = Math.min(canvas.height/2 - 2*padding, blockWidth - 2*padding)/2;

    // A player has joined this bubble slot
    var playerBubble = new createjs.Container();
    var fillCircle = new createjs.Shape();
    fillCircle.graphics.beginFill('white').drawCircle(0, 0, radius);
    fillCircle.shadow = new createjs.Shadow('#000000', -5, 3, 10);
    playerBubble.addChild(fillCircle);

    // An empty bubble for a player to join
    var joinBubble = new createjs.Container();
    var joinCircle = new createjs.Shape();
    joinCircle.graphics.setStrokeDash([6,4]);
    joinCircle.graphics.setStrokeStyle(2).beginStroke('white').drawCircle(0, 0, radius);
    joinBubble.addChild(joinCircle);
    var joinText = new createjs.Text('join', '26px Cambria', '#ffffff');
    var bounds = joinText.getBounds();
    joinText.x = -bounds.width/2;
    joinText.y = -bounds.height/2;
    joinBubble.addChild(joinText);

    for (var i = 0; i < Math.max(4, state.players.length+1); i++) {
        var bubble = null;
        if (i < state.players.length) {
            bubble = playerBubble.clone(true);
            editPlayerBubble(bubble, radius, state.players[i]);
        } else  {
            bubble = joinBubble.clone(true);
        }
        bubble.x = padding + blockWidth*i + blockWidth/2;
        bubble.y = 0.75*canvas.height;
        stage.addChild(bubble);
    }
}

function drawPlayerBubble(stage, index) {
    /*
    var filter = null;
    switch (player.color) {
        case 'blue':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 255, 0);
            break;
        case 'yellow':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 255, 255, 0, 0);
            break;
        case 'orange':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 255, 165, 0, 0);
            break;
        case 'green':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 0, 255, 0, 0);
            break;
        case 'red':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 255, 0, 0, 0);
            break;
        case 'white':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 255, 255, 255, 0);
            break;
        case 'magenta':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 255, 0, 255, 0);
            break;
        case 'black':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 0, 0);
            break;
        case 'brown':
            filter = new createjs.ColorFilter(0, 0, 0, 1, 150, 100, 50, 0);
            break;
    }
    drawScissors(stage, filter, 30+100*index, 30);
    */
}

function draw() {
    var stage = new createjs.Stage('infCanvas');
    drawLobbyBackground(stage);
    drawLobbyBomb(stage);
    drawGameCode(stage);
    drawBubbles(stage);
    stage.update();
}

function update(newState) {
    state = newState;
    draw();
}
