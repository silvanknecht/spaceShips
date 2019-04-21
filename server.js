const express = require("express");
const app = express();
const path = require("path");
const compression = require("compression");
const httpServer = require("http").createServer(app);

// middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(compression());

app.use(express.static("public"));

// index
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
  console.log("hallo");
});

httpServer.listen(process.env.port || 3000, function() {
  console.log("HTTP - Server running at Port 3000");
});

/**===================SPACE========================== */
const Player = require("./Player");
const Team = require("./Team");

global.HEIGHT = 800;
global.WIDTH = 1200;
global.FPS = 60;
global.FRICTION = 0.7;
global.TIME_DEAD = 3; // in seconds

const MAX_PLAYERS = 5;

let teams = [];
let team1 = new Team(0, "yellow", "#ffff00");
teams.push(team1);
let team2 = new Team(1, "puple", "#FF00FF");
teams.push(team2);

const io = require("socket.io")(httpServer);
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
                gameFinished(t, t1);
              }
            }
          }
        }
      }
    }
  }
  //
}, 1);

function gameFinished(t, t1) {
  io.emit("gameEnd", t1.name);
  t.restore();
  t1.restore();
  // var clients = io.sockets.clients();
  // for(let c of clients){
  //   c.team = undefined;
  // }
}
