function State(gameCode) {
    this.gameCode = gameCode;
    this.players = [];
    this.colors = ['blue', 'yellow', 'orange', 'green',
        'red', 'magenta', 'black', 'brown'];
}

State.prototype.addUser = function(userid, username) {
    var rindex = Math.floor(Math.random()*this.colors.length);
    this.players.push({
        userid: userid,
        username: username,
        color: this.colors.splice(rindex, 1)[0]
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
