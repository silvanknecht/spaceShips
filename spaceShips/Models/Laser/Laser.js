class Laser {
  constructor(x1, y1, shipAngle) {
    this.speed = 1200; // Pixels per second //changed from 1200
    this.dmg = 10;
    this.length = 15;
    this.maxDist = 1000; // Distance in pixle
    this.position = {
      x1,
      y1,
      x2: x1 + this.length * Math.cos(shipAngle),
      y2: y1 - this.length * Math.sin(shipAngle)
    };
    this.spapwnPos = { x1: this.position.x1, y1: this.position.y1 };
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
    // check if laser has traveled max distance
    if (
      this.position.x1 > this.spapwnPos.x1 + this.maxDist ||
      this.position.x1 < this.spapwnPos.x1 - this.maxDist ||
      this.position.y1 > this.spapwnPos.y1 + this.maxDist ||
      this.position.y1 < this.spapwnPos.y1 - this.maxDist
    ){
      this.needsDelete = true;
    }

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
