ScreenEnum = {
    LOBBY: 0
}

function State(gameCode) {
    this.gameCode = gameCode;
    this.screen = ScreenEnum.LOBBY;
    this.players = [];
    this.colors = ['skyblue', 'lime', 'orange', 'pink'];
}

State.prototype.addUser = function(userid, username) {
    var rindex = Math.floor(Math.random()*this.colors.length);
    this.players.push({
        userid: userid,
        username: username,
        gameMaster: false,
        dirty: true,
        color: this.colors.splice(rindex, 1)[0]
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
        if (removedPlayer.gameMaster && this.players.length >= 1) {
            this.players[0].gameMaster = true;
        }
    }
    // If we have less than 2 people, end the game
    if (this.players.length < 2) {
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
