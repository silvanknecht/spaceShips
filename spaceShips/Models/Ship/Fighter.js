const Ship = require("./Ship");

class Fighter extends Ship {
  constructor(teamId, userId) {
    super(teamId, userId);
    this.type = "Triangle";
    this.corners = {
      x1: this.position.x,
      y1: this.position.y - this.size,
      x2: this.position.x - Math.sin((60 * Math.PI) / 180) * this.size,
      y2: this.position.y + this.size / 2,
      x3: this.position.x + Math.sin((60 * Math.PI) / 180) * this.size,
      y3: this.position.y + this.size / 2
    };
  }

  turn() {
    this.corners.x1 =
      this.position.x + (4 / 3) * this.size * Math.cos(this.angle);
    this.corners.y1 =
      this.position.y - (4 / 3) * this.size * Math.sin(this.angle);
    this.corners.x2 =
      this.position.x -
      this.size * ((2 / 3) * Math.cos(this.angle) + Math.sin(this.angle));
    this.corners.y2 =
      this.position.y +
      this.size * ((2 / 3) * Math.sin(this.angle) - Math.cos(this.angle));
    this.corners.x3 =
      this.position.x -
      this.size * ((2 / 3) * Math.cos(this.angle) - Math.sin(this.angle));
    this.corners.y3 =
      this.position.y +
      this.size * ((2 / 3) * Math.sin(this.angle) + Math.cos(this.angle));
  }

  turnCalcX(x, y) {
    //console.log(x);
    return x * Math.cos(this.angle) - y * Math.sin(this.angle);
  }
  turnCalcY(x, y) {
    return x * Math.sin(this.angle) - y * Math.cos(this.angle);
  }
}

module.exports = Fighter;
