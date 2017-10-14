// Root canvas element and stage
var canvas = null;
var stage = null;
var state = null;

// Load game assets
function loadGame(stateObj, callback) {
    // Set initial state object reference
    state = stateObj;

    // Set initial canvas dimensions
    canvas = document.getElementById('espyCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage('espyCanvas');

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
    var barWidth = 300;
    var barHeight = 80;
    var barX = canvas.width/2 - barWidth/2;
    var barY = canvas.height/2 - barHeight/2;
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

        // Notify IO to start the game
        callback();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        update();
    }
}

function generateCloud() {
    var cloud = new createjs.Container();
    var circle1 = new createjs.Shape();
    var circle2 = new createjs.Shape();
    circle1.graphics.beginFill('#d8d8e0').drawCircle(-10, 0, 30);
    circle2.graphics.beginFill('#d8d8e0').drawCircle(10, 0, 30);
    cloud.addChild(circle1);
    cloud.addChild(circle2);
    return cloud;
}

function cloudComplete(cloud) {
    cloud.x = 0;
    createjs.Tween.get(cloud)
        .to({alpha:1, x:canvas.width/10}, 6000)
        .to({x:(9*canvas.width)/10}, 10000)
        .to({alpha:0, x:canvas.width}, 6000)
        .call(cloudComplete, cloud, this);
}

function drawClouds() {
    var ys = [150, 350, 650, 450];
    for (var i = 0; i < ys.length; i++) {
        var cloud = generateCloud();
        cloud.alpha = 0;
        cloud.x = 0;
        cloud.y = ys[i];
        createjs.Tween.get(cloud)
            .to({alpha:1, x:canvas.width/10}, 6000)
            .to({x:(9*canvas.width)/10}, 5000)
            .to({alpha:0, x:canvas.width}, 6000)
            .call(function() {
                cloud.x = 0;
                createjs.Tween.get(cloud)
                    .to({alpha:1, x:canvas.width/10}, 6000)
                    .to({x:(9*canvas.width)/10}, 5000)
                    .to({alpha:0, x:canvas.width}, 6000)
                    .call(cloudComplete);
            });
        stage.addChild(cloud);
    }
}

function update() {
    stage.removeAllChildren();
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
    drawClouds();
}
