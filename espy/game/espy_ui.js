// Global objects
var stage = null;
var state = null;

// Base dimensions of the game
var WIDTH = 1920;
var HEIGHT = 1200;

// Shrink or stretch to the smaller of the two ratios
function resizeCanvas() {
    var scaleToFitX = window.innerWidth / WIDTH;
    var scaleToFitY = window.innerHeight / HEIGHT;
    var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
    var canvas = document.getElementById('espyCanvas');
    canvas.style.width = WIDTH * optimalRatio;
    canvas.style.height = HEIGHT * optimalRatio;
}

// Load game assets
function loadGame(stateObj, callback) {
    // Set reference to state object
    state = stateObj;

    // Set canvas dimensions and resize
    var canvas = document.getElementById('espyCanvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    resizeCanvas();

    // Set the stage
    stage = new createjs.Stage('espyCanvas');

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
    var barWidth = 300;
    var barHeight = 80;
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
        { id: 'splish', src: '/sound/splish.mp3' }
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
}

function generateCloud() {
    var cloud = new createjs.Shape();
    cloud.graphics.beginFill('#d8d8e0').beginStroke('#a0a0a0');
    cloud.graphics.moveTo(-150, 75).lineTo(150, 75);
    cloud.graphics.bezierCurveTo(230, 75, 230, -10, 150, -10);
    cloud.graphics.bezierCurveTo(150, -70, 70, -70, 70, -70);
    cloud.graphics.bezierCurveTo(70, -140, -110, -140, -110, -50);
    cloud.graphics.bezierCurveTo(-220, -50, -220, 75, -150, 75);
    return cloud;
}

function tweenCloud(cloud) {
    var x = Math.random()*WIDTH - 400;
    var y = Math.random()*(HEIGHT-250) + 125;
    var step = WIDTH/20 + y/3;
    console.log('step of y=' + y + ' is ' + step);
    cloud.x = x;
    cloud.y = y;
    createjs.Tween.get(cloud, {loop: false})
        .wait(Math.random()*30000)
        .to({alpha:1, x:x+step}, 10000)
        .to({x:x+step*2}, 10000)
        .to({alpha:0, x:x+step*3}, 10000)
        .call(tweenCloud, [cloud]);
}

function drawClouds() {
    for (var i = 0; i < 10; i++) {
        var cloud = generateCloud();
        cloud.alpha = 0;
        cloud.x = Math.random() * (WIDTH-50) + 25;
        cloud.y = Math.random() * (HEIGHT-50) + 25;
        stage.addChild(cloud);
        tweenCloud(cloud);
    }
}

function update() {
    stage.removeAllChildren();
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
    drawClouds();
}
