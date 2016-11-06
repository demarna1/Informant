/*
 * Informant game server
 */
var express = require('express');

exports.socketServer = function(app, server) {
    var routes = require('./main/routes');
    app.use(express.static(__dirname + '/main'));
    app.use(express.static(__dirname + '/game'));
    routes(app);

    var io = require('socket.io')(server);
    var infNamespace = io.of('/informant');
    infNamespace.on('connection', function(socket) {
        console.log('new Informant connection');
    });
};
