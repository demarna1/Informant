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
    if (cardMemory[gameCode].blackCards.length == 0) {
        cardMemory[gameCode].blackCards = cardJson.blackCards.slice();
    }
    var rindex = Math.floor(Math.random()*cardMemory[gameCode].blackCards.length);
    return cardMemory[gameCode].blackCards.splice(rindex, 1)[0];
};

exports.whiteCards = function(gameCode, numCards) {
    var whiteCards = [];
    if (cardMemory[gameCode].whiteCards.length < numCards) {
        cardMemory[gameCode].whiteCards = cardJson.whiteCards.slice();
    }
    for (var i = 0; i < numCards; i++) {
        var rindex = Math.floor(Math.random()*cardMemory[gameCode].whiteCards.length);
        whiteCards.push(cardMemory[gameCode].whiteCards.splice(rindex, 1)[0]);
    }
    return whiteCards;
};
