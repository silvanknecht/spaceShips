const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../../server/models/user");
const logger = require("../../server/middleware/logger");
const Player = require("../Models/Player/Player");
const Shield = require("../Models/Item/Shield");

class FreeForAll {
  constructor(io, nameSpace) {
    /** Game settings */
    this.MAX_PLAYERS = 10;
    this.GAMELENGTH = 60 * 10; //10 * 60; // in seconds
    this.currentTime;

    // set up teams
    this.playerCount = 0;
    this.players = [];
    this.leaderboard = [];

    /** Server */
    this.type = "freeForAll";
    this.nameSpace = nameSpace;
    this.running = false;
    this.finished = false;
    this.open = true;
    this.tdm = io.of(`/${nameSpace}`).on("connection", client => {
      client.on("joinGame", jwtToken => {
        // authenticate
        let user;
        try {
          user = jwt.verify(jwtToken.split(" ")[1], config.get("jwtSecret"));
          logger.debug("A user tries to connect to the server", user);
        } catch (error) {
          client.emit("serverInfo", "tokenExpired");
          return;
        }

        /* Only one Player for every account */
        for (let gM of gameServers[this.type]) {
          for (let p of gM.players) {
            logger.debug(
              "Checking if user is alread assigned to a player: ",
              p.userId + "   " + user.sub._id
            );

            if (p.userId === user.sub._id) {
              console.log("already exists");
              client.emit("serverInfo", "existsAlready");
              return;
            }
          }
        }

        this.joinGame(client, user);
      });
    });

    /** ITEMS  */
    this.items = [];

    /** Free For All */
    this.MIN_PLAYERS = 2;
    this.KILL_GOAL = 30;
    // lasers
    this.projectiles = [{ lasers: [] }];
  }

  start() {
    this.currentTime = this.GAMELENGTH;
    this.running = true;
    setInterval(this.update.bind(this), 1000 / FPS);
    setInterval(this.updateGameTime.bind(this), 1000);
    setInterval(this.updateItems.bind(this), 10000);
    setInterval(this.updateLeaderboard.bind(this), 1000);
    this.tdm.emit("gameStarted");
  }

  update() {
    this.deleteLasers();
    // move lasers

    for (let p of this.projectiles) {
      for (let l of p.lasers) {
        l.update();
      }
    }

    for (let p of this.players) {
      if (p.ship !== undefined) {
        // maybe the ship isn't created yet at this point --> player.js
        if (p.ship.isDead !== true) {
          p.ship.update(this.items);
        }
        if (p.ship.isDead) {
          p.ship.respawnTime -= 1;
          if (p.ship.respawnTime <= 0) {
            p.ship.restore();
          }
        }
      }
    }
    this.tdm.emit("update", this.prepareDataToSend());

    //** Collision detection */

    for (let p of this.players) {
      if (p.ship === undefined) break;
      if (p.ship.isDead !== true) {
        let checkForHit = p.ship.checkForHit(this.projectiles[0].lasers);

        // send the laser that needs to be deleted to the client so the laser can be deleted clientside as well
        if (checkForHit.laser !== undefined) {
          this.tdm.emit("laserHit_laserToDelete", checkForHit.laser);
        }

        if (checkForHit.died) {
          p.ship.isDead = true;
          p.stats.deaths++;
          for (let killer of this.players) {
            if (killer.userId === checkForHit.laser.userId) {
              killer.stats.kills++;
              this.tdm.emit("killFeed", { killer, corps: p });
              if (killer.stats.kills >= this.KILL_GOAL) {
                this.gameFinished();
              }
            }
          }
        } else {
          if (checkForHit.hit) {
            this.tdm.emit("gotHit", { hit: checkForHit.hit });
          }
        }
      }
    }
    if (this.players.length === 0) {
      this.gameFinished();
    }

    this.deleteLasers();
  }

  /** GAMETIME */
  updateGameTime() {
    if (this.currentTime > 0) {
      this.currentTime--;
      this.tdm.emit("serverTime", this.currentTime);
    } else {
      this.gameFinished();
    }
  }

  //  every ** seconds add a shield to playfield
  updateItems() {
    if (this.items.length < this.MAX_PLAYERS / 2) {
      let newItem = new Shield();
      this.items.push(newItem);
    }
  }

  updateLeaderboard() {
    this.leaderboard = [];
    for (let p of this.players) {
      if (this.leaderboard.length === 0) {
        this.leaderboard.push(p);
      } else {
        for (let [i, leader] of this.leaderboard.entries()) {
          if (p.stats.kills > leader.stats.kills) {
            this.leaderboard.splice(i, 0, p);
            break;
          } else {
            if (i === this.leaderboard.length - 1) {
              this.leaderboard.push(p);
              break;
            }
          }
        }
      }
    }
  }

  /* Defines what happens when the game ended*/
  gameFinished() {
    this.updateLeaderboard();
    this.running = false;
    for (let p of this.players) {
      p.updateStats();
    }

    if (this.currentTime > 0) {
      this.tdm.emit(
        "gameEnd",
        JSON.stringify({
          message: "Time run out!",
          leaderboard: this.leaderboard
        })
      );
    } else {
      this.tdm.emit(
        "gameEnd",
        JSON.stringify({
          message: "Player reach reached kill goal!",
          leaderboard: this.leaderboard
        })
      );
    }

    this.finished = true;
  }

  deleteLasers() {
    for (let p of this.projectiles) {
      for (let i = p.lasers.length - 1; i >= 0; i--) {
        if (p.lasers[i].needsDelete) {
          p.lasers.splice(i, 1);
        }
      }
    }
  }
  searchPlayerShip(client) {
    let { id } = client;

    return this.players.find(x => x.id === id).ship;
  }
  prepareDataToSend() {
    return {
      players: this.players,
      items: this.items,
      leaderboard: this.leaderboard
    };
  }
  async joinGame(client, user) {
    /** Only allow a user to create a player if he isn't already in the game */

    /** After the player has connected check if there is place on the server and what team has less players  --> place the new player in that team */
    user = await User.findById(user.sub._id);

    let player = new Player(client.id, user);

    if (this.players.length !== this.MAX_PLAYERS) {
      this.players.push(player);
      this.playerCount++;
      player.spawnShip();
    } else {
      client.emit("serverInfo", "serverFull");
      return;
    }

    client.on("turn", mouseDir => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined && this.running) {
        shipToUpdate.angle = mouseDir;
      }
    });

    client.on("thrusting", bool => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined && this.running) {
        if (bool) {
          shipToUpdate.thrusting = true;
        } else {
          shipToUpdate.thrusting = false;
        }
      }
    });

    client.on("shooting", bool => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined && this.running) {
        if (bool && !shipToUpdate.isDead) {
          let laserFired = shipToUpdate.shoot();
          if (laserFired.laser) {
            this.projectiles[0].lasers.push(laserFired.laser);
          }
          this.tdm.emit("laserFired", laserFired);
        }
      }
    });

    /** After disconnect delete client */
    client.on("disconnect", () => {
      for (let i = this.players.length - 1; i >= 0; i--) {
        if (this.players[i].id === client.id) {
          this.players.splice(i, 1);
          this.playerCount--;
          break;
        }
      }
      for (let i = this.leaderboard.length - 1; i >= 0; i--) {
        if (this.leaderboard[i].id === client.id) {
          this.leaderboard.splice(i, 1);
          break;
        }
      }
      if (this.players.length === 0) {
        this.finished = true;
      }
    });

    // LATENCY CHECK ON CLINENT SIDE (ping and pong events are reserved by socket.this.tdm and can therefore not be used)
    client.on("p1ng", function() {
      client.emit("p0ng");
    });

    this.tdm.emit(
      "startInfo",
      `Waiting for players: ${this.playerCount}/${this.MIN_PLAYERS}`
    );
    if (this.playerCount === this.MIN_PLAYERS) {
      let callCount = 5;
      let _this = this;
      let repeater = setInterval(function() {
        if (callCount > 0) {
          _this.tdm.emit("startInfo", `Game starts in ${callCount}`);
          callCount--;
        } else {
          clearInterval(repeater);
          _this.start();
        }
      }, 1000);
    }

    if (this.running) {
      this.tdm.emit("gameStarted");
    }
  }
}

module.exports = FreeForAll;
