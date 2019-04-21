const Fighter = require("./Fighter");

class Player {
  constructor(id) {
    this.id = id;
    this.ship;
    this.name = "Anonymous";
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
  }

  joinTeam(team) {
    team.players.push(this);
    this.spawnShip(team.id);
  }
  leaveTeam(team) {
    for (let i = team.players.length - 1; i >= 0; i--) {
      if (team.players[i].id === this.id) {
        team.players.splice(i, 1);
        this.teamId = undefined;
      }
    }
  }

  spawnShip(teamId) {
    this.ship = new Fighter(teamId);
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
  }
}

module.exports = Player;
