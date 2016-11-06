/*
 * Global site server
 */
var express = require('express');
var app = express();
var nodeServer = require('http').createServer(app);
var nodePort = process.env.PORT || 3000;

nodeServer.listen(nodePort, function() {
    console.log('Node.js server listening on port ' + nodePort);
});

var infServer = require('./informant/inf_server.js');
//var cahServer = require('./cah/cah_server.js');
infServer.socketServer(app, nodeServer);
//cahServer.socketServer(app, nodeServer);
