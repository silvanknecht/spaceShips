const { getRandomColor } = require("../../tools.js");
const Laser = require("../Laser/Laser");
const collide = require("triangle-circle-collision");

class Ship {
  constructor(teamId) {
    if (new.target === Ship) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.teamId = teamId;
    this.name = Math.random();
    this.color = getRandomColor();
    this.health = 100;
    this.size = 14; // middle to corners
    this.position = this.giveTeamPosition(teamId);
    this.angle = this.gitveTeamAngle(teamId); // rad
    this.shipThrust = 10;
    this.thrusting = false;
    this.thrust = {
      x: 0, // pixel per second
      y: 0 // pixel per second
    };
    this.speedcap = 10;
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.ammo = 100;
    this.lasers = [];
    this.shield = { hitpoints: 0 };
  }

  update() {
    // move lasers
    for (let l of this.lasers) {
      l.update();
    }
    // hudge performance loss without if statements
    // check if boarder is left
    if (
      this.position.x < this.size + 5 ||
      this.position.x > WIDTH - (this.size + 5)
    ) {
      this.position.x = Math.min(
        Math.max(parseInt(this.position.x), (this.size * 4) / 3),
        WIDTH - (this.size * 4) / 3
      );
    }
    if (
      this.position.y < this.size + 5 ||
      this.position.y > HEIGHT - (this.size + 5)
    ) {
      this.position.y = Math.min(
        Math.max(parseInt(this.position.y), (this.size * 4) / 3),
        HEIGHT - (this.size * 4) / 3
      );
    }
    this.move();
    this.turn();
    this.deleteLasers();
    this.pickUpItem();
  }

  // returns true if dead
  checkForHit(lasers) {
    //delete lasers with needsDelete = true;
    this.deleteLasers();

    // check if hit triangle point collision
    let areaOrig = Math.abs(
      (this.corners.x2 - this.corners.x1) *
        (this.corners.y3 - this.corners.y1) -
        (this.corners.x3 - this.corners.x1) *
          (this.corners.y2 - this.corners.y1)
    );

    for (let l of lasers) {
      for (let p = 0; p <= l.length; p++) {
        let pointToTest = {
          x: l.position.x1 + p * l.unitVector[0],
          y: l.position.y1 + p * l.unitVector[1]
        };

        let area1 = Math.abs(
          (this.corners.x1 - pointToTest.x) *
            (this.corners.y2 - pointToTest.y) -
            (this.corners.x2 - pointToTest.x) *
              (this.corners.y1 - pointToTest.y)
        );
        let area2 = Math.abs(
          (this.corners.x2 - pointToTest.x) *
            (this.corners.y3 - pointToTest.y) -
            (this.corners.x3 - pointToTest.x) *
              (this.corners.y2 - pointToTest.y)
        );
        let area3 = Math.abs(
          (this.corners.x3 - pointToTest.x) *
            (this.corners.y1 - pointToTest.y) -
            (this.corners.x1 - pointToTest.x) *
              (this.corners.y3 - pointToTest.y)
        );

        if (area1 + area2 + area3 === areaOrig) {
          if (this.shield.hitpoints > 0) {
            this.shield.hitpoints -= l.dmg;
            if (this.shield.hitpoints < 0) {
              this.health -= this.shield.hitpoints;
              this.shield = { hitpoints: 0 };
            }
          } else {
            this.health -= l.dmg;
          }

          if (this.health <= 0) {
            this.isDead = true;
            return true;
          }
          l.needsDelete = true;
          break;
        } else {
          //console.log("not hit");
        }
      }
    }
    return false;
  }

  move() {
    if (this.thrusting) {
      this.thrust.x += (this.shipThrust * Math.cos(this.angle)) / FPS;
      this.thrust.y -= (this.shipThrust * Math.sin(this.angle)) / FPS;

      if (this.thrust.x > this.speedcap) {
        this.thrust.x = this.speedcap;
      } else if (this.thrust.x < -this.speedcap) {
        this.thrust.x = -this.speedcap;
      }
      if (this.thrust.y > this.speedcap) {
        this.thrust.y = this.speedcap;
      } else if (this.thrust.y < -this.speedcap) {
        this.thrust.y = -this.speedcap;
      }
    } else {
      this.thrust.x -= (FRICTION * this.thrust.x) / FPS;
      this.thrust.y -= (FRICTION * this.thrust.y) / FPS;
    }
    this.position.x += this.thrust.x;
    this.position.y += this.thrust.y;
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

  shoot() {
    this.lasers.push(new Laser(this.corners.x1, this.corners.y1, this.angle));
  }

  deleteLasers() {
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      if (this.lasers[i].needsDelete) {
        this.lasers.splice(i, 1);
      }
    }
  }

  giveTeamPosition(teamId) {
    let x;
    let y = Math.random() * (HEIGHT - 25 - 25) + 25;

    // depending on what team the player is spawn on that side
    switch (teamId) {
      case 0:
        x = Math.random() * (150 - 25) + 25;

        break;
      case 1:
        x = Math.random() * (WIDTH - 25 - (WIDTH - 150)) + (WIDTH - 150);
        break;
    }
    return { x, y };
  }

  // direction in which the points
  gitveTeamAngle(teamId) {
    switch (teamId) {
      case 0:
        return (1 / 180) * Math.PI;
        break;
      case 1:
        return (180 / 180) * Math.PI;
        break;
    }
  }

  pickUpItem() {
    if (items !== 0) {
      for (let [i, it] of items.entries()) {
        let collided = collide(
          [
            [this.corners.x1, this.corners.y1],
            [this.corners.x2, this.corners.y2],
            [this.corners.x3, this.corners.y3]
          ],
          [it.position.x, it.position.y],
          it.d / 2
        );
        if (collided) {
          switch (it.name) {
            case "shield":
              this.shield = it;
              it.pickedUp();
              break;
          }
        }
      }
    }
  }

  restore() {
    this.health = 100;
    this.size = 14; // middle to corners
    this.position = this.giveTeamPosition(this.teamId);
    this.angle = this.gitveTeamAngle(this.teamId); // rad
    this.shipThrust = 10;
    this.thrusting = false;
    this.thrust = {
      x: 0, // pixel per second
      y: 0 // pixel per second
    };
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.ammo = 100;
    this.lasers = [];
    this.shield = { hitpoints: 0 };
  }
}

module.exports = Ship;
