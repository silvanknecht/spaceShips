class Laser {
  constructor(x1, y1, shipAngle) {
    this.speed = 1;
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
  }

  update() {
    this.move();
    this.checkForLeftScreen();
  }


  move() {
    let dirVec = [
      this.position.x2 - this.position.x1,
      this.position.y2 - this.position.y1
    ];
    this.position.x1 += this.speed * dirVec[0];
    this.position.y1 += this.speed * dirVec[1];
    this.position.x2 += this.speed * dirVec[0];
    this.position.y2 += this.speed * dirVec[1];
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
