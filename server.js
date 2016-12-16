// Entry point - create node.js server with Express
var express = require('express');
var app = express();
var nodeServer = require('http').createServer(app);

// Configure main site routes
var path = require('path');
app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.resolve('main/favicon.ico'));
});
app.use(express.static(__dirname + '/main'));
app.get('/', function(req, res) {
    res.sendFile(path.resolve('main/index.html'));
});

// Configure Informant routes
app.use(express.static(__dirname + '/informant/game'));
app.use(express.static(__dirname + '/informant/play'));
app.get('/informant', function(req, res) {
    if (req.query.gameCode && req.query.name) {
        res.sendFile(path.resolve('informant/play/inf_play.html'));
    } else {
        res.sendFile(path.resolve('informant/game/inf_game.html'));
    }
});

// Configure Cards Against Humanity routes
app.use(express.static(__dirname + '/cah/game'));
app.use(express.static(__dirname + '/cah/play'));
app.get('/cah', function(req, res) {
    if (req.query.gameCode && req.query.name) {
        res.sendFile(path.resolve('cah/play/cah_play.html'));
    } else {
        res.sendFile(path.resolve('cah/game/cah_game.html'));
    }
});

// Start server
var nodePort = process.env.PORT || 3000;
nodeServer.listen(nodePort, function() {
    console.log('Node.js server listening on port ' + nodePort);
});

// Create socket.io servers for each game
var io = require('socket.io')(nodeServer);
var infServer = require('./informant/inf_server.js');
var cahServer = require('./cah/cah_server.js');
infServer.addListener(io);
cahServer.addListener(io);

// Redirect to proper page on user login
app.get('/play', function(req, res) {
    var gameCode = req.query.gameCode;
    var name = req.query.name;
    if (gameCode in cahServer.rooms) {
        res.json({
            'result': 'success',
            'url': '/cah'
        });
    } else if (gameCode in infServer.rooms) {
        res.json({
            'result': 'success',
            'url': '/informant'
        });
    } else {
        res.json({'result': 'error'});
    }
});
