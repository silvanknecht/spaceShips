const Laser = require("./Laser");

class Ship {
  constructor(x, y) {
    this.name = Math.random();
    this.health = 100;
    this.isDead = false;
    this.r = 15; // middle to point
    this.position = {
      x,
      y
    };
    this.corners = {
      x1: x,
      y1: y - this.r,
      x2: x - Math.sin((60 * Math.PI) / 180) * this.r,
      y2: y + this.r / 2,
      x3: x + Math.sin((60 * Math.PI) / 180) * this.r,
      y3: y + this.r / 2
    };

    this.angle = (90 / 180) * Math.PI;
    this.turnSpeed = 5;
    this.rotatingR = false;
    this.rotatingL = false;
    this.rotation = 0;
    this.shipThrust = 5;
    this.thrusting = false;
    this.thrust = {
      x: 0,
      y: 0
    };

    this.ammo = 100;
  }

  update(lasers) {
    // lasers
    // for (let i = this.lasers.length - 1; i >= 0; i--) {
    //   this.lasers[i].update();
    //   if (this.lasers[i].needsDelete) {
    //     this.lasers.splice(i, 1);
    //   }
    // }

    // hudge performance loss
    if (this.position.x < 20 || this.position.x > WIDTH - 20) {
      this.position.x = Math.min(
        Math.max(parseInt(this.position.x), (this.r * 4) / 3),
        WIDTH - (this.r * 4) / 3
      );
    }
    if (this.position.y < 20 || this.position.y > HEIGHT - 20) {
      this.position.y = Math.min(
        Math.max(parseInt(this.position.y), (this.r * 4) / 3),
        HEIGHT - (this.r * 4) / 3
      );
    }
    this.checkForHit(lasers);
    this.move();
    this.turn();
  }

  checkForHit(lasers) {
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
      //console.log(area1);
      if (area1 + area2 + area3 == areaOrig) {
        this.health -= l.dmg;
        if(this.health <= 0){
          this.isDead = true;
        }
        console.log("hitt!!!");
      } else {
        //console.log("not hit");
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
      this.rotation -= (FRICTION * this.rotation) / FPS;
    }
    this.angle += this.rotation;
    this.corners.x1 = this.position.x + (4 / 3) * this.r * Math.cos(this.angle);
    this.corners.y1 = this.position.y - (4 / 3) * this.r * Math.sin(this.angle);
    this.corners.x2 =
      this.position.x -
      this.r * ((2 / 3) * Math.cos(this.angle) + Math.sin(this.angle));
    this.corners.y2 =
      this.position.y +
      this.r * ((2 / 3) * Math.sin(this.angle) - Math.cos(this.angle));
    this.corners.x3 =
      this.position.x -
      this.r * ((2 / 3) * Math.cos(this.angle) - Math.sin(this.angle));
    this.corners.y3 =
      this.position.y +
      this.r * ((2 / 3) * Math.sin(this.angle) + Math.cos(this.angle));
  }

  shoot() {
    lasers.push(new Laser(this.corners.x1, this.corners.y1, this.angle));
  }
}

module.exports = Ship;
