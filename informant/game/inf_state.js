ScreenEnum = {
    LOBBY: 0,
    BOMB_OVERVIEW: 0
}

function State(gameCode) {
    this.gameCode = gameCode;
    this.screen = ScreenEnum.LOBBY;
    this.players = [];
    this.colors = ['blue', 'yellow', 'orange', 'green',
        'red', 'magenta', 'black', 'brown'];
    this.sounds = ['whoosh', 'ding', 'sudden-impact', 'splish',
        'punch', 'transition-whoosh', 'toasty', 'bronx-cheer'];
}

State.prototype.addUser = function(userid, username) {
    var rindex = Math.floor(Math.random()*this.colors.length);
    this.players.push({
        userid: userid,
        username: username,
        color: this.colors.splice(rindex, 1)[0],
        sound: this.sounds.splice(rindex, 1)[0]
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
        this.colors.push(this.players[indexToRemove].color);
        this.sounds.push(this.players[indexToRemove].sound);
        this.players.splice(indexToRemove, 1);
    }
};

State.prototype.getUser = function(userid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            return this.players[i];
        }
    }
};
