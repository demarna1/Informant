// Root canvas element and stage
var canvas = null;
var stage = null;
var state = null;

// Load game assets
function loadGame(stateObj, callback) {
    // Set initial state object reference
    state = stateObj;

    // Set initial canvas dimensions
    canvas = document.getElementById('wbCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage('wbCanvas');

    // Progress bar initialization
    var progressText = new createjs.Text();
    progressText.set({
        text: '0% Loaded',
        color: '#000000',
        font: '26px Arial',
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
    loadRect.graphics.beginFill('#ffffff');
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
        { id: 'chalk-1to2-letters', src: '/sound/chalk-1to2-letters.mp3' },
        { id: 'chalk-3to4-letters', src: '/sound/chalk-3to4-letters.mp3' },
        { id: 'chalk-5to6-letters', src: '/sound/chalk-5to6-letters.mp3' }
    ]);

    function handleProgress() {
        progressText.text = (queue.progress*100|0) + '% Loaded';
        loadRect.graphics.clear().beginFill('#ffffff');
        loadRect.graphics.drawRect(barX, barY, barWidth*queue.progress, barHeight);
        stage.update();
    }

    function handleComplete() {
        // Set resize listener
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Notify IO to start the game
        callback();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        update();
    }
}

function playChalkSound(numLetters) {
    switch (numLetters) {
    case 1:
    case 2:
        createjs.Sound.play('chalk-1to2-letters');
        break;
    case 3:
    case 4:
        createjs.Sound.play('chalk-3to4-letters');
        break;
    default:
        createjs.Sound.play('chalk-5to6-letters');
        break;
    }
}

function drawTitle() {
    var title = 'WORD BLITZ';
    var text = new createjs.Text(title, '80px Eraser', '#ffffff');
    text.x = canvas.width/2 - text.getBounds().width/2;
    text.y = 0;

    if (state.transition == 0) {
        state.transition = 1;
        playChalkSound(4);
        createjs.Ticker.setInterval(350);
        createjs.Ticker.addEventListener('tick', drawTitleLetter);
        createjs.Ticker.dispatchEvent('tick');

        function drawTitleLetter(event) {
            if (state.transition == 6) {
                playChalkSound(5);
            }
            text.text = title.substr(0, state.transition);
            stage.addChild(text);
            stage.update();
            state.transition += 1;
            if (state.transition > title.length) {
                event.remove();
            }
        }
    } else if (state.transition > title.length) {
        stage.addChild(text);
    }
}

function drawPlayerNames() {
    for (var i = 0; i < state.players.length; i++) {
        var player = state.players[i];

        var text = new createjs.Text();
        text.set({
            text: player.username,
            font: '50px Eraser',
            x: 30,
            y: 100 + 100*i
        });
        switch (player.color) {
        case 'skyblue':
            text.color = '#bbddff';
            break;
        case 'lime':
            text.color = '#ccffbb';
            break;
        case 'orange':
            text.color = '#ffdd88';
            break;
        case 'pink':
            text.color = '#ffbbbb';
            break;
        }

        stage.addChild(text);

        if (player.dirty) {
            player.dirty = false;
            playChalkSound(player.username.length);
            text.text = player.username.substr(0, 1);
            var numChars = 1;
            createjs.Ticker.setFPS(3);
            createjs.Ticker.addEventListener('tick', function(event) {
                text.text = player.username.substr(0, numChars);
                stage.update();
                numChars += 1;
                if (numChars > player.username.length) {
                    event.remove();
                }
            });
        }
    }
}

function drawLobbyPage() {
    drawTitle();
    drawPlayerNames();
    //drawInfoBox();
}

function update() {
    stage.removeAllChildren();
    switch (state.screen) {
        case ScreenEnum.LOBBY:
            drawLobbyPage();
            break;
    }
    stage.update();
}