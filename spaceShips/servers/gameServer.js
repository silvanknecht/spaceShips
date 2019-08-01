const jwt = require("jsonwebtoken");
const config = require("config");

const logger = require("../../server/middleware/logger");
const Player = require("../Models/Player/Player");
const Team = require("../Models/Team/Team");
const Shield = require("../Models/Item/Shield");

class GameServer {
  constructor(io, nameSpace) {
    /** Game settings */
    this.MAX_PLAYERS = 4;
    this.GAMELENGTH = 60 * 10; //10 * 60; // in seconds
    this.currentTime = this.GAMELENGTH;

    // set up teams
    this.playerCount = 0;
    this.teams = [];
    this.teams.push(new Team(0, "yellow", "#ffff00"));
    this.teams.push(new Team(1, "puple", "#FF00FF"));

    /** Server */
    this.nameSpace = nameSpace;
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
        for (let t of this.teams) {
          for (let p of t.players) {
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

    // lasers
    this.projectiles = [{ lasers: [] }, { lasers: [] }];

    /** ITEMS  */
    this.items = [];
    setInterval(this.update.bind(this), 1000 / FPS);
    setInterval(this.updateGameTime.bind(this), 1000);
    setInterval(this.updateItems.bind(this), 10000);
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
              this.gameFinished(t1);
            }
          } else {
            if (checkForHit.hit) {
              this.tdm.emit("gotHit", { hit: checkForHit.hit });
            }
          }
        }
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
      this.currentTime = this.GAMELENGTH;
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
  gameFinished(t1) {
    for (let t of this.teams) {
      for (let p of t.players) {
        p.updateStats();
      }
    }
    if (t1) {
      this.tdm.emit("gameEnd", "Team: " + t1.name + " won the game!");
    } else {
      this.tdm.emit("gameEnd", "Time Run out!");
    }
    for (let t of this.teams) {
      t.restore();
      for (let p of t.players) {
        p.spawnShip(t.id);
      }
    }
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
    let player = new Player(client.id, user.sub._id);

    if (
      this.teams[0].players.length <= this.teams[1].players.length &&
      this.teams[0].players.length < this.MAX_PLAYERS
    ) {
      player.joinTeam(this.teams[0]);
      client.team = this.teams[0].id;
      this.playerCount++;
    } else if (this.teams[1].players.length < this.MAX_PLAYERS) {
      player.joinTeam(this.teams[1]);
      client.team = this.teams[1].id;
      this.playerCount++;
    } else {
      client.emit("serverInfo", "serverFull");
      return;
    }

    client.on("turn", mouseDir => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined) {
        shipToUpdate.angle = mouseDir;
      }
    });

    client.on("thrusting", bool => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined) {
        if (bool) {
          shipToUpdate.thrusting = true;
        } else {
          shipToUpdate.thrusting = false;
        }
      }
    });

    client.on("shooting", bool => {
      let shipToUpdate = this.searchPlayerShip(client);
      if (shipToUpdate !== undefined) {
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

module.exports = GameServer;
