ScreenEnum = {
    LOBBY: 0,
    BOMB_OVERVIEW: 1
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function State(gameCode) {
    this.gameCode = gameCode;
    this.screen = ScreenEnum.LOBBY;
    this.players = [];
    this.misRate = 0;
    this.colors = ['blue', 'yellow', 'orange', 'green',
        'red', 'purple', 'black', 'brown'];
    this.sounds = ['whoosh', 'ding', 'sudden-impact', 'splish',
        'punch', 'transition-whoosh', 'toasty', 'bronx-cheer'];
}

State.prototype.addUser = function(userid, username) {
    var rindex = Math.floor(Math.random()*this.colors.length);
    this.players.push({
        userid: userid,
        username: username,
        gameMaster: false,
        color: this.colors.splice(rindex, 1)[0],
        sound: this.sounds.splice(rindex, 1)[0]
    });
    if (this.players.length == 1) {
        this.players[0].gameMaster = true;
    }
};

State.prototype.removeUser = function(userid) {
    var indexToRemove = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            indexToRemove = i;
        }
    }
    if (indexToRemove > -1) {
        var removedPlayer = this.players.splice(indexToRemove, 1)[0];
        this.colors.push(removedPlayer.color);
        this.sounds.push(removedPlayer.sound);
        if (removedPlayer.gameMaster && this.players.length >= 1) {
            this.players[0].gameMaster = true;
        }
    }
    // If the spy left and there's only one spy or if we have
    // less than 4 people, end the game.
    if (this.players.length < 4) {
        state.screen = ScreenEnum.LOBBY;
    }
};

State.prototype.getUser = function(userid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            return this.players[i];
        }
    }
};

State.prototype.startGame = function() {
    state.screen = ScreenEnum.BOMB_OVERVIEW;

    // Choose role rate
    roleRates = {
        '4': [{'spies': 1, 'rate': 0.25}],
        '5': [{'spies': 1, 'rate': 0.30}, {'spies': 2, 'rate': 0.10}],
        '6': [{'spies': 2, 'rate': 0.20}],
        '7': [{'spies': 2, 'rate': 0.25}],
        '8': [{'spies': 2, 'rate': 0.30}]
    };
    roleRate = roleRates[this.players.length][getRandomInt(0, 1)];
    numSpies = roleRate.spies;
    this.misRate = roleRate.rate;

    // Set roles
    shuffle(this.players);
    for (var i = 0; i < numSpies; i++) {
        this.players[i].role = 'spy';
        console.log(this.players[i].color + ' is a ' + this.players[i].role);
    }
    for (var i = numSpies; i < this.players.length; i++) {
        this.players[i].role = 'informant';
        console.log(this.players[i].color + ' is a ' + this.players[i].role);
    }
};
