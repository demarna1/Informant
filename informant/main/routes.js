/*
 * Application routes go here.
 */
var path = require('path');
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.sendFile(path.resolve('informant/main/index.html'));
    });
    app.get('/game', function(req, res) {
        res.sendFile(path.resolve('informant/game/practice.html'));
    });
}
