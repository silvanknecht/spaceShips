class Team {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.players = [];
    this.tickets = 30;
  }

  restore(){
    this.tickets = 30;
  }
}

module.exports = Team;
