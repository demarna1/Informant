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
    var text = new createjs.Text(title, '60px Eraser', getChalkColor('white'));
    var textScale = (canvas.width*0.42)/text.getBounds().width;
    text.scaleX = text.scaleY = textScale;
    text.x = canvas.width/2 - (text.getBounds().width*textScale)/2;
    text.y = canvas.height*0.08;

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
    var label = 'game code:';
    var labelText = new createjs.Text(label, '42px Eraser', getChalkColor('white'));
    var textScale = (canvas.width*0.22)/labelText.getBounds().width;
    labelText.scaleX = labelText.scaleY = textScale;
    labelText.x = canvas.width/2 - (labelText.getBounds().width*textScale)/2;
    labelText.y = canvas.height*0.30;
    stage.addChild(labelText);

    var code = state.gameCode;
    var codeText = new createjs.Text(code, '60px Eraser', getChalkColor('yellow'));
    codeText.scaleX = codeText.scaleY = textScale;
    codeText.x = canvas.width/2 - (codeText.getBounds().width*textScale)/2;
    codeText.y = labelText.y + labelText.getBounds().height*textScale;
    stage.addChild(codeText);
}

function drawPlayerNames() {
    var sampleText = new createjs.Text('player', '42px Eraser');
    var textScale = (canvas.width*0.15)/sampleText.getBounds().width;

    for (var i = 0; i < state.players.length; i++) {
        var player = state.players[i];

        var text = new createjs.Text(player.username, '42px Eraser');
        text.scaleX = text.scaleY = textScale;
        text.x = canvas.width/2 + (canvas.width/6)*(i%2*2-1) -
            (text.getBounds().width*textScale)/2;
        text.y = canvas.height*0.60 + canvas.height*0.15*Math.floor(i/2);
        text.color = getChalkColor(player.color);
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

    var title = new createjs.Text('Get Ready!', '60px Eraser', getChalkColor('white'));
    var titleScale = (canvas.width*0.42)/title.getBounds().width;
    title.scaleX = title.scaleY = titleScale;
    title.x = canvas.width/2 - (title.getBounds().width*titleScale)/2;
    title.y = canvas.height*0.08;

    var time = 5;
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
        stage.removeAllChildren();
        var text = new createjs.Text(time, '80px Eraser', getChalkColor('white'));
        text.x = canvas.width/2 - text.getBounds().width/2;
        text.y = canvas.height/2 - text.getBounds().height/2;
        stage.addChild(text);
        stage.addChild(title);
        stage.update();
        time -= 1;
        if (time < 0) {
            createjs.Ticker.removeAllEventListeners();
            callback();
        }
    }
}

function drawRoundWord() {
    var text = new createjs.Text(state.roundWord, '60px Eraser', getChalkColor('white'));
    var textScale = (canvas.width*0.22)/text.getBounds().width;
    text.scaleX = text.scaleY = textScale;
    text.x = canvas.width/2 - (text.getBounds().width*textScale)/2;
    text.y = canvas.height*0.06;

    if (state.transition == 0) {
        state.transition = 1;
        createjs.Ticker.setInterval(375);
        createjs.Ticker.addEventListener('tick', drawRoundWordLetter);

        function drawRoundWordLetter(event) {
            if (state.transition == 1) {
                playChalkSound(6);
            }
            text.text = state.roundWord.substr(0, state.transition);
            stage.addChild(text);
            stage.update();
            state.transition += 1;
            if (state.transition > 6) {
                event.remove();
            }
        }
    } else if (state.transition > 6) {
        stage.addChild(text);
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
    var sampleText = new createjs.Text('------', '36px Eraser');
    var columnWidth = (canvas.width - 200)/6;
    var rowHeight = canvas.height*(0.07 - 0.0075*(numRows - 6));
    var marginLeft = 100 + (columnWidth/2)*(6-numColumns) +
        (columnWidth - sampleText.getBounds().width)/2;

    // Draw all solved words or unsolved dashes
    for (var i = 0; i < state.roundMatches.length; i++) {
        var match = state.roundMatches[i];
        var word = match.word;
        if (!match.solved) {
            word = word.replace(/[A-Z]/g, '-');
        }
        var text = new createjs.Text(word, '36px Eraser', getChalkColor(match.color));
        text.x = marginLeft + columnWidth*Math.floor(i/numRows);
        text.y = canvas.height*0.23 + rowHeight*(i%numRows);
        stage.addChild(text);
    }
}

function drawRoundPage() {
    drawRoundWord();
    drawRoundMatches();
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
