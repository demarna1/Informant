// Root canvas element and stage
var canvas = null;
var stage = null;

// Cached state (for resizing events)
var state = null;

// Game assets
var informantLogo = null;
var lobbyBackground = null;
var lobbyBomb = null;
var scissorsColorOpen = null;
var scissorsFrameOpen = null;
var lobbyContainer = null;

// Color filters
var colorFilters = {
    'blue': new createjs.ColorFilter(0, 0, 0, 1, 15, 43, 170, 0),
    'yellow': new createjs.ColorFilter(0, 0, 0, 1, 255, 255, 0, 0),
    'orange': new createjs.ColorFilter(0, 0, 0, 1, 255, 136, 0, 0),
    'green': new createjs.ColorFilter(0, 0, 0, 1, 20, 163, 13, 0),
    'red': new createjs.ColorFilter(0, 0, 0, 1, 232, 16, 16, 0),
    'purple': new createjs.ColorFilter(0, 0, 0, 1, 192, 24, 192, 0),
    'black': new createjs.ColorFilter(0, 0, 0, 1, 16, 16, 16, 0),
    'brown': new createjs.ColorFilter(0, 0, 0, 1, 128, 80, 32, 0)
};

// Load game assets
function loadGame(callback) {
    // Set initial canvas dimensions
    canvas = document.getElementById('infCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage('infCanvas');

    // Progress bar initialization
    var progressText = new createjs.Text();
    progressText.set({
        text: '0% Loaded',
        font: '26px Play',
        color: '#000000',
        textAlign: 'center',
        textBaseline: 'middle',
        x: canvas.width/2,
        y: canvas.height/2
    });
    var barX = canvas.width/2 - 150;
    var barY = canvas.height/2 - 40;
    var barWidth = 300;
    var barHeight = 80;
    var loadRect = new createjs.Shape();
    loadRect.graphics.beginFill('#c00000');
    loadRect.graphics.drawRect(barX, barY, 0, barHeight);
    var borderRect = new createjs.Shape();
    borderRect.graphics.setStrokeStyle(3).beginStroke('black');
    borderRect.graphics.drawRect(barX, barY, barWidth, barHeight);
    stage.addChild(loadRect);
    stage.addChild(borderRect);
    stage.addChild(progressText);
    stage.update();

    var queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.on('progress', handleProgress);
    queue.on('complete', handleComplete);
    queue.loadManifest([
        { id: 'informantLogo', src: '/img/InformantLogo.png' },
        { id: 'lobbyBackground', src: '/img/SheetMetal.png' },
        { id: 'lobbyBomb', src: '/img/LobbyBomb.png' },
        { id: 'scissorsColorOpen', src: '/img/ScissorsColorOpen.png' },
        { id: 'scissorsFrameOpen', src: '/img/ScissorsFrameOpen.png' },
        { id: 'lobbyMusic', src: '/sound/lobby-music.mp3' },
        { id: 'bronx-cheer', src: '/sound/bronx-cheer.mp3' },
        { id: 'ding', src: '/sound/ding.mp3' },
        { id: 'punch', src: '/sound/punch.mp3' },
        { id: 'splish', src: '/sound/splish.mp3' },
        { id: 'sudden-impact', src: '/sound/sudden-impact.mp3' },
        { id: 'toasty', src: '/sound/toasty.mp3' },
        { id: 'transition-whoosh', src: '/sound/transition-whoosh.mp3' },
        { id: 'whoosh', src: '/sound/whoosh.mp3' }
    ]);

    // Update progress bar
    function handleProgress() {
        progressText.text = (queue.progress*100|0) + '% Loaded';
        loadRect.graphics.clear().beginFill('#c00000');
        loadRect.graphics.drawRect(barX, barY, barWidth*queue.progress, barHeight);
        stage.update();
    }

    function handleComplete() {
        // Get image handles and create bitmaps
        informantLogo = queue.getResult('informantLogo');
        lobbyBackground = queue.getResult('lobbyBackground');
        lobbyBomb = queue.getResult('lobbyBomb');
        scissorsColorOpen = queue.getResult('scissorsColorOpen');
        scissorsFrameOpen = queue.getResult('scissorsFrameOpen');

        // Set resize listener
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

function drawBackground(container) {
    var bg = new createjs.Bitmap(lobbyBackground);
    var filter = new createjs.ColorFilter(0.5, 0.5, 0.5, 1, 0, 0, 0, 0);
    var scale = 0.65;
    bg.scaleX = scale;
    bg.scaleY = scale;
    for (var i = 0; i < canvas.width/(bg.image.width*scale); i++) {
        for (var j = 0; j < canvas.height/(bg.image.height*scale); j++) {
            var bgpiece = bg.clone();
            bgpiece.filters = [filter];
            bgpiece.cache(0, 0, bg.image.width, bg.image.height);
            bgpiece.x = i*(bgpiece.image.width*scale);
            bgpiece.y = j*(bgpiece.image.height*scale);
            container.addChild(bgpiece);
        }
    }
}

function drawBomb(container) {
    var bomb = new createjs.Bitmap(lobbyBomb);
    var padding = 40;
    var scaleWidth = (canvas.width*0.4 - padding*2) / bomb.image.width;
    var scaleHeight = (canvas.height*0.6 - padding*2) / bomb.image.height;
    var scale = Math.min(scaleWidth, scaleHeight);
    bomb.scaleX = scale;
    bomb.scaleY = scale;
    bomb.x = (canvas.width*0.4 - bomb.image.width*scale)/2;
    bomb.y = (canvas.height*0.6 - bomb.image.height*scale)/2;
    container.addChild(bomb);
}

function drawInfoBox(container) {
    var padding = 20;
    var box = new createjs.Shape();
    var boxX = canvas.width*0.4 + padding;
    var boxY = padding;
    var boxWidth = canvas.width*0.6 - padding*2;
    var boxHeight = canvas.height*0.6 - padding;
    box.graphics.beginFill('black').drawRoundRect(boxX, boxY, boxWidth, boxHeight, 10);
    box.alpha = 0.3;
    box.shadow = new createjs.Shadow('#000000', -5, 3, 10);
    container.addChild(box);

    var logo = new createjs.Bitmap(informantLogo);
    var scaleWidth = (boxWidth - padding*2) / logo.image.width;
    var scaleHeight = (boxHeight/3 - padding*2) / logo.image.height;
    var lScale = Math.min(scaleWidth, scaleHeight);
    logo.scaleX = lScale;
    logo.scaleY = lScale;
    logo.x = (boxWidth - logo.image.width*lScale)/2 + boxX;
    logo.y = (boxHeight/3 - logo.image.height*lScale)/2 + boxY;
    container.addChild(logo);

    var info = new createjs.Text();
    info.set({
        text: 'Join on your mobile device at\nwww.noahd.com',
        font: '26px Play',
        color: '#dcdcdc',
        textAlign: 'center',
        textBaseline: 'middle',
        x: boxWidth/2 + boxX,
        y: (boxHeight/3)/2 + boxY + (boxHeight*2)/3
    });
    container.addChild(info);

    var code = new createjs.Text('Room Code: ' + state.gameCode, 'bold 26px Play', '#ffA000');
    var cScale = (canvas.width*0.6)/(code.getBounds().width*2.5);
    code.scaleX = cScale;
    code.scaleY = cScale;
    code.x = canvas.width*0.7 - (code.getBounds().width*cScale)/2;
    code.y = canvas.height*0.3 - (code.getBounds().height*cScale)/2 + padding/10;
    container.addChild(code);
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

    scissors.filters = [colorFilters[player.color]];
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

function drawBubbles(container) {
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
        container.addChild(bubble);
    }
}

function drawLobbyPage() {
    lobbyContainer = new createjs.Container();
    drawBackground(lobbyContainer);
    drawBomb(lobbyContainer);
    drawInfoBox(lobbyContainer);
    drawBubbles(lobbyContainer);
    stage.addChild(lobbyContainer);
}

function animateLobbyPage(callback) {
    lobbyContainer.x = canvas.width*0.20;
    lobbyContainer.y = canvas.height*0.25;
    lobbyContainer.regX = canvas.width*0.20;
    lobbyContainer.regY = canvas.height*0.25;
    var time = 0;
    createjs.Ticker.setFPS(30);
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.addEventListener('tick', function() {
        if (lobbyContainer.rotation > -62) {
            lobbyContainer.rotation -= 0.46;
        }
        lobbyContainer.scaleX += 0.00003*time*time;
        lobbyContainer.scaleY += 0.00003*time*time;
        stage.update();
        time += 1;
        if (time >= 160) {
            createjs.Ticker.removeAllEventListeners();
            callback();
        }
    });
}

function playLobbyMusic(start) {
    if (start) {
        createjs.Sound.play('lobbyMusic', {loop: -1});
    } else {
        createjs.Sound.stop();
    }
}

function playJoinSound(userid) {
    createjs.Sound.play(state.getUser(userid).sound);
}

function draw() {
    stage.removeAllChildren();
    if (state.screen == ScreenEnum.LOBBY) {
        drawLobbyPage();
    }
    stage.update();
}

function update(newState) {
    state = newState;
    draw();
}
