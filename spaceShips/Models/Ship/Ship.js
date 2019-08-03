const { getRandomColor } = require("../../tools.js");
const Laser = require("../Laser/Laser");
const collide = require("triangle-circle-collision");

class Ship {
  constructor(teamId, userId) {
    if (new.target === Ship) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.teamId = teamId;
    this.userId = userId;
    this.name = Math.random();
    this.color = getRandomColor();
    this.health = 100;
    this.size = 14; // middle to corners
    this.position = this.giveTeamPosition(teamId);
    this.angle = this.gitveTeamAngle(teamId); // rad
    this.shipThrust = 10;
    this.thrusting = false;
    this.velocity = {
      x: 0, // pixel per second
      y: 0 // pixel per second
    };
    this.speedcap = 10;
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.ammo = 15;
    this.reloadingTime = 2000;
    this.timereload = false;
    this.reloading = false;
    this.shield = { hitpoints: 0 };
  }

  update(items) {
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
    this.pickUpItem(items);
  }

  // returns true and the killing laser if dead
  checkForHit(lasers) {
    // check if hit triangle point collision
    let areaOrig = Math.abs(
      (this.corners.x2 - this.corners.x1) *
        (this.corners.y3 - this.corners.y1) -
        (this.corners.x3 - this.corners.x1) *
          (this.corners.y2 - this.corners.y1)
    );

    for (let l of lasers) {
      if (l.userId !== this.userId) {
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
              l.needsDelete = true;
              return { died: true, laser: l };
            }
            l.needsDelete = true;
            return { hit: this.userId, died: false, laser: l };
          } else {
            //console.log("not hit");
          }
        }
      }
    }
    return { died: false };
  }

  move() {
    let thrustXY = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    let thrustXNow = this.velocity.x;
    let thrustYNow = this.velocity.y;

    if (this.thrusting) {
      this.velocity.x += (this.shipThrust * Math.cos(this.angle)) / FPS;
      this.velocity.y -= (this.shipThrust * Math.sin(this.angle)) / FPS;

      if (thrustXY > this.speedcap) {
        this.velocity.x = thrustXNow;
        this.velocity.y = thrustYNow;
      }
    } else {
      this.velocity.x -= (FRICTION * this.velocity.x) / FPS;
      this.velocity.y -= (FRICTION * this.velocity.y) / FPS;
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  shoot() {
    if (this.ammo > 0) {
      let laser = new Laser(
        this.position.x,
        this.position.y,
        this.angle,
        this.userId
      );
      this.ammo--;
      console.log("ammo", this.ammo);

      if (!this.timereload) {
        this.timereload = true;
        setTimeout(() => {
          if (this.ammo !== 15) {
            console.log("ammoReloaded due to time");
            this.ammo++;
          }
          this.timereload = false;
        }, 500);
      }

      return { laser, reloading: this.reloading };
    } else {
      if (!this.reloading) {
        this.reloading = true;
        setTimeout(() => {
          this.ammo = 15;
          this.reloading = false;
        }, this.reloadingTime);
      }
    }
    return { reloading: this.reloading };
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
      default:
        x = Math.random() * (WIDTH - 25 - 25) + 25;
        break;
    }
    return { x, y };
  }

  // direction in which the points
  gitveTeamAngle(teamId) {
    switch (teamId) {
      case 0:
        return (1 / 180) * Math.PI;
      case 1:
        return (180 / 180) * Math.PI;
      default:
        return Math.random() * Math.PI * 2;
    }
  }

  pickUpItem(items) {
    if (items !== 0) {
      for (let [i, it] of items.entries()) {
        let collided = collide(
          [
            [this.corners.x1, this.corners.y1],
            [this.corners.x2, this.corners.y2],
            [this.corners.x3, this.corners.y3]
          ],
          [it.position.x, it.position.y],
          it.d / 2 - 20
        );
        if (collided) {
          switch (it.name) {
            case "shield":
              this.shield = it;
              it.pickedUp(items);
              break;
          }
        }
      }
    }
  }

  restore() {
    this.health = 100;
    this.position = this.giveTeamPosition(this.teamId);
    this.angle = this.gitveTeamAngle(this.teamId); // rad
    this.thrusting = false;
    this.velocity = {
      x: 0, // pixel per second
      y: 0 // pixel per second
    };
    this.isDead = false;
    this.respawnTime = TIME_DEAD * FPS;
    this.shield = { hitpoints: 0 };
  }
}

module.exports = Ship;
