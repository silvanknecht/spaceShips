class Team {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.players = [];
    this.tickets = 1;
  }

  restore(){
    this.tickets = 1;
  }
}

module.exports = Team;
