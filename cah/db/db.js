var cardJson = require('./cah-base.json');
var cardMemory = {};

exports.setup = function(gameCode) {
    if (!(gameCode in cardMemory)) {
        cardMemory[gameCode] = {};
        cardMemory[gameCode].blackCards = cardJson.blackCards.slice();
        cardMemory[gameCode].whiteCards = cardJson.whiteCards.slice();
    }
};

exports.cleanup = function(gameCode) {
    if (gameCode in cardMemory) {
        delete cardMemory[gameCode];
    }
};

exports.blackCard = function(gameCode) {
    // TODO
    return "House";
};

exports.whiteCard = function(gameCode) {
    // TODO
    return "esuoH";
};
