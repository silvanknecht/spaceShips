class Laser {
  constructor(x1, y1, shipAngle) {
    this.speed = 1200; // Pixels per second
    this.dmg = 5;
    this.length = 20;
    this.position = {
      x1,
      y1,
      x2: x1 + this.length * Math.cos(shipAngle),
      y2: y1 - this.length * Math.sin(shipAngle)
    };
    this.color = "rgb(255,0,0)";
    this.needsDelete = false;
    this.unitVector = this.calcUnitVector();
  }

  calcUnitVector() {
    let dif =
      (this.position.x2 - this.position.x1) ** 2 +
      (this.position.y2 - this.position.y1) ** 2;
    let unitVector = [
      (this.position.x2 - this.position.x1) / Math.sqrt(dif),
      (this.position.y2 - this.position.y1) / Math.sqrt(dif)
    ];
    return unitVector;
  }

  update() {
    this.move();
    this.checkForLeftScreen();
  }

  move() {
    this.position.x1 += (this.speed / FPS) * this.unitVector[0];
    this.position.y1 += (this.speed / FPS) * this.unitVector[1];
    this.position.x2 += (this.speed / FPS) * this.unitVector[0];
    this.position.y2 += (this.speed / FPS) * this.unitVector[1];
  }

  checkForLeftScreen() {
    if (
      this.position.x1 > WIDTH ||
      this.position.x1 < 0 ||
      this.position.x2 > WIDTH ||
      this.position.x2 < 0 ||
      this.position.y1 > HEIGHT ||
      this.position.y1 < 0 ||
      this.position.y2 > HEIGHT ||
      this.position.y2 < 0
    ) {
      this.needsDelete = true;
    }
  }
}

module.exports = Laser;
