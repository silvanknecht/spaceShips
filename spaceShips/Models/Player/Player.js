const Fighter = require("../Ship/Fighter");
const User = require("../../../server/models/user");
const ShipPreferences = require("../../../server/models/shipPreferences");

class Player {
  constructor(id, user) {
    this.id = id;
    this.userId = user.sub._id;
    this.ship;
    this.name = user.sub.nickname;
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.stats = {
      kills: 0,
      deaths: 0
    };
  }

  joinTeam(team) {
    team.players.push(this);
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
    let user = await User.findOne({ _id: this.userId });
    let activeShipObjectId = user.activeShip;
    let hexString = activeShipObjectId.toHexString();

    switch (hexString) {
      case "5cc5de13b03b9f3584348a69":
        //TODO: fetch size, health, etc, from database
        this.ship = new Fighter(teamId, this.userId);
        break;
    }
  }

  async updateStats() {
    let user = await User.findOne({ _id: this.userId });
    let activeShipObjectId = user.activeShip;

    await ShipPreferences.findOneAndUpdate(
      {
        userId: this.userId,
        shipId: activeShipObjectId
      },
      { $inc: { kills: this.stats.kills, deaths: this.stats.deaths } }
    );
    this.stats.kills = 0;
    this.stats.deaths = 0;
  }
}

module.exports = Player;
