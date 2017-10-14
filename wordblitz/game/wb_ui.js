// Root canvas element and stage
var canvas = null;
var stage = null;
var state = null;

// Base dimensions of the game
var WIDTH = 1920;
var HEIGHT = 1200;

// Load game assets
function loadGame(stateObj, callback) {
    // Set initial state object reference
    state = stateObj;

    // Set initial canvas dimensions
    canvas = document.getElementById('wbCanvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    stage = new createjs.Stage('wbCanvas');

    // Progress bar initialization
    var progressText = new createjs.Text();
    progressText.set({
        text: '0% Loaded',
        color: '#000000',
        font: '26px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        x: WIDTH/2,
        y: HEIGHT/2
    });
    var barWidth = 200;
    var barHeight = 50;
    var barX = WIDTH/2 - barWidth/2;
    var barY = HEIGHT/2 - barHeight/2;
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

    // Sounds and images to load
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
        update();

        // Notify IO to start the game
        callback();
    }

    function resizeCanvas() {
        // Shrink or stretch to the smaller of the two ratios
        var scaleToFitX = window.innerWidth / WIDTH;
        var scaleToFitY = window.innerHeight / HEIGHT;
        var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
        canvas.style.width = WIDTH * optimalRatio;
        canvas.style.height = HEIGHT * optimalRatio;
    }
}

function getChalkColor(color) {
    switch (color) {
    case 'white':   return '#ffffff';
    case 'yellow':  return '#ffffcc';
    case 'skyblue': return '#bbddff';
    case 'lime':    return '#ccffbb';
    case 'orange':  return '#ffdd88';
    case 'pink':    return '#ffbbbb';
    default:        return '#000000';
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
    var text = new createjs.Text(title, '120px Eraser', getChalkColor('white'));
    text.x = WIDTH/2 - text.getBounds().width/2;
    text.y = HEIGHT*0.08;

    if (state.transition == 0) {
        state.transition = 1;
        createjs.Ticker.setInterval(425);
        createjs.Ticker.addEventListener('tick', drawTitleLetter);

        function drawTitleLetter(event) {
            if (state.transition == 1) {
                playChalkSound(4);
            }
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

function drawInfoBox() {
    var labelText = new createjs.Text('game code:', '72px Eraser', getChalkColor('white'));
    labelText.x = WIDTH/2 - labelText.getBounds().width/2;
    labelText.y = HEIGHT*0.30;
    stage.addChild(labelText);

    var codeText = new createjs.Text(state.gameCode, '72px Eraser', getChalkColor('yellow'));
    codeText.x = WIDTH/2 - codeText.getBounds().width/2;
    codeText.y = labelText.y + labelText.getBounds().height;
    stage.addChild(codeText);
}

function drawPlayerNames() {
    for (var i = 0; i < state.players.length; i++) {
        var player = state.players[i];
        var text = new createjs.Text(player.username, '72px Eraser', getChalkColor(player.color));
        text.x = WIDTH/2 + (WIDTH/6)*(i%2*2-1) - text.getBounds().width/2;
        text.y = HEIGHT*0.60 + HEIGHT*0.15*Math.floor(i/2);
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
    drawInfoBox();
    drawPlayerNames();
}

function animateRoundPage(callback) {
    stage.removeAllChildren();
    state.screen = ScreenEnum.ROUND_TRANSITION;

    var title = new createjs.Text('Get Ready!', '108px Eraser', getChalkColor('white'));
    title.x = WIDTH/2 - title.getBounds().width/2;
    title.y = HEIGHT/4 - title.getBounds().height/2;
    stage.addChild(title);

    var time = 5;
    var text = new createjs.Text(time, '144px Eraser', getChalkColor('white'));
    text.x = WIDTH/2 - text.getBounds().width/2;
    text.y = HEIGHT/2 - text.getBounds().height/2;
    stage.addChild(text);

    createjs.Ticker.setFPS(1);
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.addEventListener('tick', drawRoundCountdown);

    function drawRoundCountdown(event) {
        // Stop the countdown if the state changed
        if (state.screen !== ScreenEnum.ROUND_TRANSITION) {
            event.remove();
            return;
        }

        // Update the countdown
        text.text = time;
        stage.update();
        time -= 1;
        if (time < 0) {
            createjs.Ticker.removeAllEventListeners();
            callback();
        }
    }
}

function drawRoundWord() {
    var text = new createjs.Text(state.roundWord, '120px Eraser', getChalkColor('white'));
    text.x = WIDTH/2 - text.getBounds().width/2;
    text.y = HEIGHT*0.06;
    if (state.transition == 0) {
        text.text = '';
    }
    stage.addChild(text);

    if (state.transition == 0) {
        state.transition = 1;
        createjs.Ticker.setInterval(375);
        createjs.Ticker.addEventListener('tick', drawRoundWordLetter);

        function drawRoundWordLetter(event) {
            if (state.transition == 1) {
                playChalkSound(6);
            }
            text.text = state.roundWord.substr(0, state.transition);
            stage.update();
            state.transition += 1;
            if (state.transition > 6) {
                event.remove();
            }
        }
    }
}

function drawRoundMatches() {
    // Determine number of rows/columns
    var numColumns = Math.floor((state.roundMatches.length-1)/6)+1;
    var numRows = 6;
    if (numColumns > 6) {
        numRows = numColumns;
        numColumns = 6;
    }

    // Calculate column width, row height, and left margin
    var sampleText = new createjs.Text('------', '60px Eraser');
    var columnWidth = (WIDTH - 200)/6;
    var rowHeight = HEIGHT*(0.07 - 0.0075*(numRows - 6));
    var marginLeft = 100 + (columnWidth/2)*(6-numColumns) +
        (columnWidth - sampleText.getBounds().width)/2;

    // Draw all solved words or unsolved dashes
    for (var i = 0; i < state.roundMatches.length; i++) {
        var match = state.roundMatches[i];
        var word = match.word;
        if (!match.solved) {
            word = word.replace(/[A-Z]/g, '-');
        }
        var text = new createjs.Text(word, '60px Eraser', getChalkColor(match.color));
        text.x = marginLeft + columnWidth*Math.floor(i/numRows);
        text.y = HEIGHT*0.23 + rowHeight*(i%numRows);
        stage.addChild(text);
    }
}

function drawRoundTimer() {
/*
        var timer = 0;
        createjs.Ticker.setInterval(1000);
        createjs.Ticker.addEventListener('tick', drawRoundTimer);
        function drawRoundTimer() {
            // Stop the timer if the state changed
            if (state.screen !== ScreenEnum.ROUND) {
                event.remove();
                return;
            }

            // Update the timer
        }
*/
}

function drawRoundPage() {
    drawRoundWord();
    drawRoundMatches();
    drawRoundTimer();
}

function update() {
    stage.removeAllChildren();
    switch (state.screen) {
        case ScreenEnum.LOBBY:
            drawLobbyPage();
            break;
        case ScreenEnum.ROUND:
            drawRoundPage();
            break;
    }
    stage.update();
}
