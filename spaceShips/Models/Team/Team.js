class Team {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.players = [];
    this.tickets = 45;
  }

  restore() {
    // no in use currently since the game gets closed anyway
    this.tickets = 45;
  }

  sorteByKills() {
    this.players = this.players.sort((a, b) =>
      a.stats.kills < b.stats.kills ? 1 : -1
    );
  }
}

module.exports = Team;
