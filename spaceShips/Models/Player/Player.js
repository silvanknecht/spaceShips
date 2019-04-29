const Fighter = require("../Ship/Fighter");

class Player {
  constructor(id, user) {
    this.id = id;
    this.ship;
    this.name = "Anonymous";
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.user = user;
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
    switch (this.user.activeShip) {
      case "5cc5de13b03b9f3584348a69":
        this.ship = new Fighter(teamId);
        break;
    }
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
  }
}

module.exports = Player;
