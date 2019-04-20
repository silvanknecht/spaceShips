const Fighter = require("./Fighter");

class Player {
  constructor(id) {
    this.id = id;
    this.teamId; // without this id, the client doesn't know which color to put on as Team color...
    this.ship;
    this.name = "Anonymous";
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
  }

  joinTeam(team) {
    team.players.push(this);
    this.teamId = team.id;
    this.spawnShip();
  }
  leaveTeam(team) {
    for (let i = team.players.length - 1; i >= 0; i--) {
      if (team.players[i].id === this.id) {
        team.players.splice(i, 1);
        this.teamId = undefined;
      }
    }
  }

  spawnShip() {
    this.ship = new Fighter(this.teamId);
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
  }
}

module.exports = Player;
