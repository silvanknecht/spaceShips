const Player = require("./Models/Player/Player");
const Team = require("./Models/Team/Team");

global.HEIGHT = 1060;
global.WIDTH = 1920;
global.FPS = 60;
global.FRICTION = 0.7;

/** Game settings */
let gameRuns = true;
const MAX_PLAYERS = 5;
const GAMELENGTH = 10 * 60; // in seconds
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
    let player = new Player(client.id);
    /** After the player has connected check if there is place on the server and what team has less players  --> place the new player in that team */
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
    }

    if (client.team !== undefined) {
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

  function searchPlayerShip(client) {
    let { team, id } = client;

    return teams[team].players.find(x => x.id === id).ship;
  }

  function prepareDataToSend() {
    return { teams, teamScores: [team1.tickets, team2.tickets] };
  }

  setInterval(function() {
    for (let t of teams) {
      for (let p of t.players) {
        if (p.isDead !== true) {
          p.ship.update();
        }
        if (p.isDead) {
          p.ship = undefined;
          p.respawnTime -= 1;
          if (p.respawnTime <= 0) {
            p.spawnShip(t.id);
          }
        }
      }
    }
    io.emit("update", prepareDataToSend());
  }, 1000 / FPS);

  setInterval(() => {
    gameTime();
  }, 1000);
  function gameTime() {
    if (currentTime > 0) {
      currentTime--;
      io.emit("serverTime", currentTime);
    } else {
      gameFinished();
      currentTime = GAMELENGTH;
    }
  }

  //faster checks
  /** check all ships against each other */
  setInterval(function() {
    for (let t of teams) {
      for (let p of t.players) {
        for (let t1 of teams) {
          for (let p1 of t1.players) {
            if (
              p !== p1 &&
              t.id !== t1.id &&
              p1.isDead !== true &&
              p.isDead !== true
            ) {
              if (p.ship.checkForHit(p1.ship.lasers)) {
                t.tickets--;
                p.isDead = true;
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

  function gameFinished(t1) {
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
