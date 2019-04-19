const { getRandomColor } = require("./tools.js");
const Laser = require("./Laser");

class Ship {
  constructor(x, y) {
    this.name = Math.random();
    this.color = getRandomColor();
    this.health = 100;
    this.isDead = false
    this.respawnTime = TIME_DEAD * FPS;
    this.radius = 20; // middle to corners
    this.position = {
      x,
      y
    };
    this.corners = {
      x1: x,
      y1: y - this.radius,
      x2: x - Math.sin((60 * Math.PI) / 180) * this.radius,
      y2: y + this.radius / 2,
      x3: x + Math.sin((60 * Math.PI) / 180) * this.radius,
      y3: y + this.radius / 2
    };

    this.angle = (90 / 180) * Math.PI; // rad
    this.turnSpeed = 5; // grad per second
    this.rotatingR = false;
    this.rotatingL = false;
    this.rotation = 0; // rad per second
    this.shipThrust = 5;
    this.thrusting = false;
    this.thrust = {
      x: 0, // pixel per second
      y: 0 // pixel per second
    };

    this.ammo = 100;
    this.lasers = [];
  }

  update() {
    // recover from death
    if(this.isDead){
      this.respawnTime -=1;
      if(this.respawnTime <= 0){
        this.isDead  = false;
        this.health = 100;
      }
    }else{
      this.respawnTime =  TIME_DEAD * FPS;
    }

    // move lasers
    for (let l of this.lasers) {
      l.update();
    }
    // hudge performance loss without if statements
    if (
      this.position.x < this.radius + 5 ||
      this.position.x > WIDTH - (this.radius + 5)
    ) {
      this.position.x = Math.min(
        Math.max(parseInt(this.position.x), (this.radius * 4) / 3),
        WIDTH - (this.radius * 4) / 3
      );
    }
    if (
      this.position.y < this.radius + 5 ||
      this.position.y > HEIGHT - (this.radius + 5)
    ) {
      this.position.y = Math.min(
        Math.max(parseInt(this.position.y), (this.radius * 4) / 3),
        HEIGHT - (this.radius * 4) / 3
      );
    }
    this.move();
    this.turn();
  }

  checkForHit(lasers) {
    //move or delete lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      if (this.lasers[i].needsDelete) {
        this.lasers.splice(i, 1);
      }
    }

    // check if hit triangle point collision
    let areaOrig = Math.abs(
      (this.corners.x2 - this.corners.x1) *
        (this.corners.y3 - this.corners.y1) -
        (this.corners.x3 - this.corners.x1) *
          (this.corners.y2 - this.corners.y1)
    );

    for (let l of lasers) {
      let area1 = Math.abs(
        (this.corners.x1 - l.position.x2) * (this.corners.y2 - l.position.y2) -
          (this.corners.x2 - l.position.x2) * (this.corners.y1 - l.position.y2)
      );
      let area2 = Math.abs(
        (this.corners.x2 - l.position.x2) * (this.corners.y3 - l.position.y2) -
          (this.corners.x3 - l.position.x2) * (this.corners.y2 - l.position.y2)
      );
      let area3 = Math.abs(
        (this.corners.x3 - l.position.x2) * (this.corners.y1 - l.position.y2) -
          (this.corners.x1 - l.position.x2) * (this.corners.y3 - l.position.y2)
      );

      if (area1 + area2 + area3 == areaOrig) {
        this.health -= l.dmg;
        if (this.health <= 0) {
          this.isDead = true;

        }
        l.needsDelete = true;
      } else {
      }
    }
  }

  move() {
    if (this.thrusting) {
      this.thrust.x += (this.shipThrust * Math.cos(this.angle)) / FPS;
      this.thrust.y -= (this.shipThrust * Math.sin(this.angle)) / FPS;
    } else {
      this.thrust.x -= (FRICTION * this.thrust.x) / FPS;
      this.thrust.y -= (FRICTION * this.thrust.y) / FPS;
    }
    this.position.x += this.thrust.x;
    this.position.y += this.thrust.y;
  }

  turn() {
    if (this.rotatingR) {
      this.rotation += ((this.turnSpeed / 180) * Math.PI) / FPS;
    } else if (this.rotatingL) {
      this.rotation -= ((this.turnSpeed / 180) * Math.PI) / FPS;
    } else {
      this.rotation -= (100 * this.rotation) / FPS;
    }
    this.angle += this.rotation;
    this.corners.x1 = this.position.x + (4 / 3) * this.radius * Math.cos(this.angle);
    this.corners.y1 = this.position.y - (4 / 3) * this.radius * Math.sin(this.angle);
    this.corners.x2 =
      this.position.x -
      this.radius * ((2 / 3) * Math.cos(this.angle) + Math.sin(this.angle));
    this.corners.y2 =
      this.position.y +
      this.radius * ((2 / 3) * Math.sin(this.angle) - Math.cos(this.angle));
    this.corners.x3 =
      this.position.x -
      this.radius * ((2 / 3) * Math.cos(this.angle) - Math.sin(this.angle));
    this.corners.y3 =
      this.position.y +
      this.radius * ((2 / 3) * Math.sin(this.angle) + Math.cos(this.angle));
  }

  shoot() {
    this.lasers.push(new Laser(this.corners.x1, this.corners.y1, this.angle));
  }
}

module.exports = Ship;
