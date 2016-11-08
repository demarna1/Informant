// Entry point - create node.js server with Express
var express = require('express');
var app = express();
var nodeServer = require('http').createServer(app);

// Configure site routes
var path = require('path');
app.use(express.static(__dirname + '/main'));
app.get('/', function(req, res) {
    res.sendFile(path.resolve('main/index.html'));
});
app.use(express.static(__dirname + '/informant/game'));
app.get('/informant', function(req, res) {
    res.sendFile(path.resolve('informant/game/practice.html'));
});
app.use(express.static(__dirname + '/cah/game'));
app.get('/cah', function(req, res) {
    res.sendFile(path.resolve('cah/game/game.html'));
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
