const Fighter = require("../Ship/Fighter");
const User = require("../../../server/models/user");

class Player {
  constructor(id, user) {
    this.id = id;
    this.ship;
    this.name = "Anonymous";
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.user = user;
  }

  async joinTeam(team) {
    team.players.push(this);
    await this.spawnShip(team.id);
  }
  leaveTeam(team) {
    for (let i = team.players.length - 1; i >= 0; i--) {
      if (team.players[i].id === this.id) {
        team.players.splice(i, 1);
        this.teamId = undefined;
      }
    }
  }

  async spawnShip(teamId) {
    let user = await User.findOne({ _id: this.user._id });
    let activeShipObjectId = user.activeShip;
    let hexString = activeShipObjectId.toHexString();

    switch (hexString) {
      case "5cc5de13b03b9f3584348a69":
        this.ship = new Fighter(teamId);
        break;
    }
  }
}

module.exports = Player;
