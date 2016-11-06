var express = require('express');
var app = express();
var server = require('http').createServer(app);
var server_port = process.env.PORT || 3000;

//var routes = require('./main/routes');
//app.use(express.static(__dirname + '/main'));
//app.use(express.static(__dirname + '/game'));
//routes(app);

server.listen(server_port, function() {
    console.log('Server listening on port ' + server_port);
});

var io = require('socket.io')(server);
var informant_namespace = io.of('/informant');
informant_namespace.on('connection', function(socket) {
    console.log('new Informant connection');
});
var cah_namespace = io.of('/cah');
cah_namespace.on('connection', function(socket) {
    console.log('new CAH connection');
});
