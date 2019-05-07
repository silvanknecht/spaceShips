const jwt = require("jsonwebtoken");
const config = require("config");

const Player = require("./Models/Player/Player");
const Team = require("./Models/Team/Team");

global.HEIGHT = 4*1060;
global.WIDTH = 4*1920;
global.SCOREBOARD_HEIGHT = 40;
global.FPS = 60;
global.FRICTION = 0.7;

/** Game settings */
let gameRuns = true;
const MAX_PLAYERS = 5;
const GAMELENGTH = 60 *10; //10 * 60; // in seconds
global.TIME_DEAD = 3; // in seconds
let currentTime = GAMELENGTH;

let teams = [];
let team1 = new Team(0, "yellow", "#ffff00");
teams.push(team1);
let team2 = new Team(1, "puple", "#FF00FF");
teams.push(team2);

module.exports = function(io) {
  io.on("connection", client => {
    console.log("New ship has connected to space!");

    /** After the player has connected check if there is place on the server and what team has less players  --> place the new player in that team */
    client.on("registerForGame", jwtToken => {
      let user;
      try {
        user = jwt.verify(jwtToken.split(" ")[1], config.get("jwtSecret"));
        console.log(user);
      } catch (error) {
        client.emit("serverInfo", "tokenExpired");
        return;
      }

      /* Only one Player for every account */
      let playerExistsAlready = false;
      for (let t of teams) {
        for (let p of t.players) {
          console.log("=============", p.userId + "   " + user.sub._id);
          if (p.userId === user.sub._id) {
            playerExistsAlready = true;
            client.emit("serverInfo", "existsAlready");
            return;
          }
        }
      }
      /** Only allow a user to create a player if he isn't already in the game */
      if (!playerExistsAlready) {
        let player = new Player(client.id, user.sub._id);

        if (
          team1.players.length <= team2.players.length &&
          team1.players.length < MAX_PLAYERS
        ) {
          player.joinTeam(team1);
          client.team = team1.id;
        } else if (team2.players.length < MAX_PLAYERS) {
          player.joinTeam(team2);
          client.team = team2.id;
        } else {
          client.emit("serverInfo", "serverFull");
          return;
        }

        client.on("rotatingR", bool => {
          let shipToUpdate = searchPlayerShip(client);
          if (shipToUpdate !== undefined) {
            if (bool) {
              shipToUpdate.rotatingR = true;
            } else {
              shipToUpdate.rotatingR = false;
            }
          }
        });

        client.on("rotatingL", bool => {
          let shipToUpdate = searchPlayerShip(client);
          if (shipToUpdate !== undefined) {
            if (bool) {
              shipToUpdate.rotatingL = true;
            } else {
              shipToUpdate.rotatingL = false;
            }
          }
        });

        client.on("thrusting", bool => {
          let shipToUpdate = searchPlayerShip(client);
          if (shipToUpdate !== undefined) {
            if (bool) {
              shipToUpdate.thrusting = true;
            } else {
              shipToUpdate.thrusting = false;
            }
          }
        });

        client.on("shooting", bool => {
          let shipToUpdate = searchPlayerShip(client);
          if (shipToUpdate !== undefined) {
            if (bool) {
              shipToUpdate.shoot();
            }
          }
        });

        /** After disconnect delete client */
        client.on("disconnect", () => {
          for (let t of teams) {
            for (let p = t.players.length - 1; p >= 0; p--) {
              if (t.players[p].id === client.id) {
                t.players.splice(p, 1);
              }
            }
          }
        });
      }
    });
  });

  function searchPlayerShip(client) {
    let { team, id } = client;

    return teams[team].players.find(x => x.id === id).ship;
  }

  function prepareDataToSend() {
    return { teams, items };
  }

  setInterval(function() {
    for (let t of teams) {
      for (let p of t.players) {
        if (p.ship !== undefined) {
          // maybe the ship isn't created yet at this point --> player.js
          if (p.ship.isDead !== true) {
            p.ship.update();
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
    io.emit("update", prepareDataToSend());
  }, 1000 / FPS);

  /** GAMETIME */
  setInterval(() => {
    if (currentTime > 0) {
      currentTime--;
      io.emit("serverTime", currentTime);
    } else {
      gameFinished();
      currentTime = GAMELENGTH;
    }
  }, 1000);

  /** ITEMS  */

  const Shield = require("./Models/Item/Shield");
  global.items = [];

  setInterval(() => {
    if (items.length < MAX_PLAYERS) {
      let newItem = new Shield();
      items.push(newItem);
    }
  }, 20000);

  //faster checks
  /** check all ships against each other
   *  lasers
   */
  setInterval(function() {
    for (let t of teams) {
      for (let p of t.players) {
        if (p.ship === undefined) break;
        for (let t1 of teams) {
          for (let p1 of t1.players) {
            if (p1.ship === undefined) break;
            if (
              p !== p1 && // can't hit himself
              t.id !== t1.id && // can't be in the same team
              p1.ship.isDead !== true && // can't be dead
              p.ship.isDead !== true
            ) {
              if (p.ship.checkForHit(p1.ship.lasers)) {
                t.tickets--;
                p.ship.isDead = true;
                p.stats.deaths++;
                p1.stats.kills++;
                if (t.tickets === 0) {
                  gameFinished(t1);
                }
              }
            }
          }
        }
      }
    }
    //
  }, 1);

  /* Defines what happens when the game ended*/
  function gameFinished(t1) {
    for (let t of teams) {
      for (let p of t.players) {
        p.updateStats();
      }
    }
    if (t1) {
      io.emit("gameEnd", "Team: " + t1.name + " won the game!");
    } else {
      io.emit("gameEnd", "Time Run out!");
    }
    for (let t of teams) {
      t.restore();
      for (let p of t.players) {
        p.spawnShip(t.id);
      }
    }
  }
};
