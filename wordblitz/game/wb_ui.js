// Root canvas element and stage
var canvas = null;
var stage = null;

// Cached state (for resizing events)
var state = null;

// Game assets
var chalkboardBackground = null;

// Load game assets
function loadGame(callback) {
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
        { id: 'chalkboardBackground', src: '/img/ChalkboardBackground.png' }
    ]);

    function handleProgress() {
        progressText.text = (queue.progress*100|0) + '% Loaded';
        loadRect.graphics.clear().beginFill('#ffffff');
        loadRect.graphics.drawRect(barX, barY, barWidth*queue.progress, barHeight);
        stage.update();
    }

    function handleComplete() {
        // Get image handles and create bitmaps
        chalkboardBackground = queue.getResult('chalkboardBackground');

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

function drawPlayerNames(player, index) {
    var text = new createjs.Text();
    text.set({
        text: player.username.substr(0, 1),
        font: '50px Chalkduster',
        x: 30,
        y: 100 + 100*index
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

    var numChars = 1;
    createjs.Ticker.setFPS(3);
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.addEventListener('tick', function() {
        text.text = player.username.substr(0, numChars);
        stage.update();
        numChars += 1;
        if (numChars > player.username.length) {
            createjs.Ticker.removeAllEventListeners();
        }
    });
}

function drawLobbyPage() {
    for (var i = 0; i < state.players.length; i++) {
        drawPlayerNames(state.players[i], i);
    }
}

function draw() {
    stage.removeAllChildren();
    drawLobbyPage();
    stage.update();
}

function update(newState) {
    state = newState;
    draw();
}
