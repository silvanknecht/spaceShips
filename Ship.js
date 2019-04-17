class Ship {
  constructor(x, y) {
    this.r = 20; // middle to point
    this.x = x;
    this.y = y;
    this.x1 = x;
    this.y1 = y - this.r;
    this.x2 = x - Math.sin((60 * Math.PI) / 180) * this.r;
    this.y2 = y + this.r / 2;
    this.x3 = x + Math.sin((60 * Math.PI) / 180) * this.r;
    this.y3 = y + this.r / 2;
    this.angle = (90 / 180) * Math.PI;
    this.TURN_SPEED = 5;
    this.rotatingR = false;
    this.rotatingL = false;
    this.rotation = 0;
    this.SHIP_THRUST = 5;
    this.thrusting = false;
    this.thrust = {
      x: 0,
      y: 0
    };
    this.lasers = [];
  }

  move() {
    if (this.thrusting) {
      this.thrust.x += (this.SHIP_THRUST * Math.cos(this.angle)) / FPS;
      this.thrust.y -= (this.SHIP_THRUST * Math.sin(this.angle)) / FPS;
    } else {
      this.thrust.x -= (FRICTION * this.thrust.x) / FPS;
      this.thrust.y -= (FRICTION * this.thrust.y) / FPS;
    }
    this.x += this.thrust.x;
    this.y += this.thrust.y;
  }

  turn() {
    if (this.rotatingR) {
      this.rotation += ((this.TURN_SPEED / 180) * Math.PI) / FPS;
    } else if (this.rotatingL) {
      this.rotation -= ((this.TURN_SPEED / 180) * Math.PI) / FPS;
    } else {
      this.rotation -= (FRICTION * this.rotation) / FPS;
    }
    this.angle += this.rotation;
    this.x1 = this.x + (4 / 3) * this.r * Math.cos(this.angle);
    this.y1 = this.y - (4 / 3) * this.r * Math.sin(this.angle);
    this.x2 =
      this.x - this.r * ((2 / 3) * Math.cos(this.angle) + Math.sin(this.angle));
    this.y2 =
      this.y + this.r * ((2 / 3) * Math.sin(this.angle) - Math.cos(this.angle));
    this.x3 =
      this.x - this.r * ((2 / 3) * Math.cos(this.angle) - Math.sin(this.angle));
    this.y3 =
      this.y + this.r * ((2 / 3) * Math.sin(this.angle) + Math.cos(this.angle));
  }

  update() {

    this.move();
    this.turn();
  }  

  shoot() {
    this.lasers.push(new Laser(this.x1, this.y1,this.angle));
  }

  draw() {
    push();
    fill(255);
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
    pop();

    for (let l of this.lasers) {
      l.update();
    }
  }
}
