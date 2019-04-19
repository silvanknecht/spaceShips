const Fighter = require("./Fighter");

class Player {
  constructor(id) {
    this.id = id;
    this.teamId;
    this.ship = new Fighter(200, 200);
    this.name = "Anonymous";
  }

  joinTeam(team) {
    team.players.push(this);
    this.teamId = team.id;
  }
  leaveTeam(team) {
    for (let i = team.players.length - 1; i >= 0; i--) {
      if (team.players[i].id === this.id) {
        team.players.splice(i, 1);
        this.teamId = undefined;
      }
    }
  }
}

module.exports = Player;
