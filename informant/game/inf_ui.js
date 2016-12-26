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
        { id: 'lobbyBackground', src: '/img/SheetMetal.png' },
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
    var filter = new createjs.ColorFilter(0.5, 0.5, 0.5, 1, 0, 0, 0, 0);
    var scale = 0.65;
    lobbybg.scaleX = scale;
    lobbybg.scaleY = scale;
    for (var i = 0; i < canvas.width/(lobbybg.image.width*scale); i++) {
        for (var j = 0; j < canvas.height/(lobbybg.image.height*scale); j++) {
            var bgpiece = lobbybg.clone();
            bgpiece.filters = [filter];
            bgpiece.cache(0, 0, lobbybg.image.width, lobbybg.image.height);
            bgpiece.x = i*(bgpiece.image.width*scale);
            bgpiece.y = j*(bgpiece.image.height*scale);
            stage.addChild(bgpiece);
        }
    }
}

function drawLobbyBomb(stage) {
    var lobbybomb = new createjs.Bitmap(lobbyBomb);
    var scaleWidth = (canvas.width*0.4) / lobbybomb.image.width;
    var scaleHeight = (canvas.height*0.6) / lobbybomb.image.height;
    var scale = Math.min(scaleWidth, scaleHeight);
    lobbybomb.scaleX = scale;
    lobbybomb.scaleY = scale;
    lobbybomb.x = (canvas.width*0.4 - lobbybomb.image.width*scale)/2;
    lobbybomb.y = (canvas.height*0.6 - lobbybomb.image.height*scale)/2;
    stage.addChild(lobbybomb);
}

function drawGameCode(stage) {
    var roundRect = new createjs.Shape();
    var padding = 20;
    roundRect.graphics.beginFill('black').drawRoundRect(canvas.width*0.4 + padding,
        padding, canvas.width*0.6 - padding*2, canvas.height*0.6 - padding, 10);
    roundRect.alpha = 0.3;
    roundRect.shadow = new createjs.Shadow('#000000', -5, 3, 10);
    stage.addChild(roundRect);

    var text = new createjs.Text(state.gameCode, '40px Russo One', '#ff8000');
    text.x = canvas.width*0.7 - text.getBounds().width/2;
    text.y = canvas.height*0.3 - text.getBounds().height/2 + padding/2;
    stage.addChild(text);
}

function editPlayerBubble(bubble, radius, player) {
    // Assets to add
    var frame = new createjs.Bitmap(scissorsFrameOpen);
    var scissors = new createjs.Bitmap(scissorsColorOpen);
    var playerText = new createjs.Text(player.username, 'bold 26px Play', '#000000');

    // Position and scale calculations
    var s = radius / Math.sqrt(2);
    var scissorsScale = (2*s) / scissors.image.width;
    var textScale = 1;
    if (playerText.getBounds().width > 2*s) {
        textScale = (2*s) / playerText.getBounds().width;
    }
    var gap = Math.max(0, ((s - (playerText.getBounds().height * textScale)) -
        (-s + scissors.image.height*scissorsScale)) - 8);

    switch (player.color) {
        case 'blue':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 255, 0)];
            break;
        case 'yellow':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 255, 255, 0, 0)];
            break;
        case 'orange':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 255, 165, 0, 0)];
            break;
        case 'green':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 255, 0, 0)];
            break;
        case 'red':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 255, 0, 0, 0)];
            break;
        case 'white':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 255, 255, 255, 0)];
            break;
        case 'magenta':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 255, 0, 255, 0)];
            break;
        case 'black':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 0, 0)];
            break;
        case 'brown':
            scissors.filters = [new createjs.ColorFilter(0, 0, 0, 1, 150, 100, 50, 0)];
            break;
    }
    scissors.cache(0, 0, scissors.image.width, scissors.image.height);
    scissors.scaleX = scissorsScale;
    scissors.scaleY = scissorsScale;
    scissors.x = -s;
    scissors.y = -s + gap/2;
    bubble.addChild(scissors);

    frame.scaleX = scissorsScale;
    frame.scaleY = scissorsScale;
    frame.x = -s;
    frame.y = -s + gap/2;
    bubble.addChild(frame);

    playerText.scaleX = textScale;
    playerText.scaleY = textScale;
    playerText.x = -(playerText.getBounds().width*textScale)/2;
    playerText.y = (s - playerText.getBounds().height*textScale) - gap/2;
    bubble.addChild(playerText);
}

function drawBubbles(stage) {
    var numBubbles = Math.min(Math.max(4, state.players.length+1), 8);
    var padding = Math.floor(canvas.width/(numBubbles*6));
    var blockWidth = (canvas.width - 2*padding)/numBubbles;
    var radius = Math.min(canvas.height*0.4 - 2*padding, blockWidth - 2*padding)/2;

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
    var joinText = new createjs.Text('join', '26px Play', '#ffffff');
    var bounds = joinText.getBounds();
    joinText.x = -bounds.width/2;
    joinText.y = -bounds.height/2;
    joinBubble.addChild(joinText);

    for (var i = 0; i < numBubbles; i++) {
        var bubble = null;
        if (i < state.players.length) {
            bubble = playerBubble.clone(true);
            editPlayerBubble(bubble, radius, state.players[i]);
        } else  {
            bubble = joinBubble.clone(true);
        }
        bubble.x = padding + blockWidth*i + blockWidth/2;
        bubble.y = 0.8*canvas.height;
        stage.addChild(bubble);
    }
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
