const jwt = require("jsonwebtoken");
const config = require("config");

const logger = require("../../server/middleware/logger");
const Player = require("../Models/Player/Player");
const Team = require("../Models/Team/Team");
const Shield = require("../Models/Item/Shield");

class TeamDeatchMatch {
  constructor(io, nameSpace) {
    /** Game settings */
    this.MAX_PLAYERS = 2;
    this.GAMELENGTH = 60 * 10; //10 * 60; // in seconds

    // set up teams
    this.playerCount = 0;
    this.players = [];
    this.teams = [];
    this.teams.push(new Team(0, "yellow", "#ffff00"));
    this.teams.push(new Team(1, "puple", "#FF00FF"));

    /** Server */
    this.type = "teamDeathMatch";
    this.nameSpace = nameSpace;
    this.currentTime;
    this.running = false;
    this.finished = false;
    this.open = true;
    this.tdm = io.of(`/${nameSpace}`).on("connection", client => {
      client.on("joinGame", jwtToken => {
        if (!this.running) {
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
          this.tdm.emit(
            "startInfo",
            `Waiting for players: ${this.playerCount}/${this.MAX_PLAYERS}`
          );
          if (this.playerCount === this.MAX_PLAYERS) {
            let callCount = 10;
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
        } else {
          console.log(`Game already in progress!`);
        }
      });
    });

    // lasers
    this.projectiles = [{ lasers: [] }, { lasers: [] }];

    /** ITEMS  */
    this.items = [];
  }

  start() {
    this.currentTime = this.GAMELENGTH;
    this.running = true;
    setInterval(this.update.bind(this), 1000 / FPS);
    setInterval(this.updateGameTime.bind(this), 1000);
    setInterval(this.updateItems.bind(this), 10000);
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

    for (let t of this.teams) {
      for (let p of t.players) {
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
    }
    this.tdm.emit("update", this.prepareDataToSend());

    //** Collision detection */

    for (let t of this.teams) {
      for (let p of t.players) {
        if (p.ship === undefined) break;
        if (p.ship.isDead !== true) {
          let checkForHit;
          switch (p.ship.teamId) {
            case 0:
              checkForHit = p.ship.checkForHit(this.projectiles[1].lasers);
              break;
            case 1:
              checkForHit = p.ship.checkForHit(this.projectiles[0].lasers);
              break;
          }
          // send the laser that needs to be deleted to the client so the laser can be deleted clientside as well
          if (checkForHit.laser !== undefined) {
            this.tdm.emit("laserHit_laserToDelete", checkForHit.laser);
            //console.log(checkForHit.laser);
          }

          if (checkForHit.died) {
            t.tickets--;

            p.ship.isDead = true;
            p.stats.deaths++;
            for (let killer of this.teams[checkForHit.laser.teamId].players) {
              if (killer.userId === checkForHit.laser.userId) {
                killer.stats.kills++;
                this.tdm.emit("killFeed", { killer, corps: p });
              }
            }
            if (t.tickets === 0) {
              this.gameFinished();
            }
          } else {
            if (checkForHit.hit) {
              this.tdm.emit("gotHit", { hit: checkForHit.hit });
            }
          }
        }
      }
      if (t.players.length === 0) {
        this.gameFinished();
      }
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
    if (this.items.length < this.MAX_PLAYERS) {
      let newItem = new Shield();
      this.items.push(newItem);
    }
  }

  /* Defines what happens when the game ended*/
  gameFinished() {
    this.running = false;
    for (let t of this.teams) {
      for (let p of t.players) {
        p.updateStats();
      }
    }
    if (this.currentTime > 0) {
      if (this.teams[0].players.length === 0) {
        this.tdm.emit("gameEnd", `Team: ${this.teams[1].name} won the game!`);
      } else {
        this.tdm.emit("gameEnd", `Team: ${this.teams[0].name} won the game!`);
      }
    } else {
      if (this.teams[0].tickets === this.teams[1].tickets) {
        this.tdm.emit("gameEnd", `Time run out: DRAW!`);
      } else if (this.teams[0].tickets > this.teams[1].tickets) {
        this.tdm.emit(
          "gameEnd",
          `Time run out! Team: ${this.teams[0].name} won the game!`
        );
      } else {
        this.tdm.emit(
          "gameEnd",
          `Time run out! Team: ${this.teams[1].name} won the game!`
        );
      }
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
    let { team, id } = client;

    return this.teams[team].players.find(x => x.id === id).ship;
  }
  prepareDataToSend() {
    return { teams: this.teams, items: this.items };
  }
  joinGame(client, user) {
    /** Only allow a user to create a player if he isn't already in the game */

    /** After the player has connected check if there is place on the server and what team has less players  --> place the new player in that team */
    let player = new Player(client.id, user);

    if (
      this.teams[0].players.length <= this.teams[1].players.length &&
      this.teams[0].players.length < this.MAX_PLAYERS
    ) {
      player.joinTeam(this.teams[0]);
      player.spawnShip(this.teams[0].id);
      client.team = this.teams[0].id;
      this.playerCount++;
      this.players.push(player);
    } else if (this.teams[1].players.length < this.MAX_PLAYERS) {
      player.joinTeam(this.teams[1]);
      player.spawnShip(this.teams[1].id);
      client.team = this.teams[1].id;
      this.playerCount++;
      this.players.push(player);
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
            this.projectiles[shipToUpdate.teamId].lasers.push(laserFired.laser);
          }
          this.tdm.emit("laserFired", laserFired);
        }
      }
    });

    /** After disconnect delete client */
    client.on("disconnect", () => {
      for (let t of this.teams) {
        for (let p = t.players.length - 1; p >= 0; p--) {
          if (t.players[p].id === client.id) {
            t.players.splice(p, 1);
            this.playerCount--;
            for (let i = this.players.length - 1; i >= 0; i--) {
              if (this.players[i].id === client.id) {
                this.players.splice(i, 1);
                console.log(this.players);
              }
            }
          }
        }
      }
    });

    // LATENCY CHECK ON CLINENT SIDE (ping and pong events are reserved by socket.this.tdm and can therefore not be used)
    client.on("p1ng", function() {
      client.emit("p0ng");
    });
  }
}

module.exports = TeamDeatchMatch;
