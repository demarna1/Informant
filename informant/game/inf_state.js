function State(gameCode) {
    this.gameCode = gameCode;
    this.players = [];
}

State.prototype.addUser = function(userid, username) {
    this.players.push({
        userid: userid,
        username: username
    });
};

State.prototype.removeUser = function(userid) {
    var indexToRemove = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            indexToRemove = i;
        }
    }
    if (indexToRemove > -1) {
        this.players.splice(indexToRemove, 1);
    }
};
