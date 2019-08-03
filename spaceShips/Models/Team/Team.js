class Team {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.players = [];
    this.tickets = 30;
  }

  restore() {
    // no in use currently since the game gets closed anyway
    this.tickets = 30;
  }
}

module.exports = Team;
