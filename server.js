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

let teams = [];
let team1 = new Team(0, "yellow", "#ffff00");
teams.push(team1);
let team2 = new Team(1, "puple", "#FF00FF");
teams.push(team2);

const io = require("socket.io")(httpServer);
io.on("connection", client => {
  console.log("New ship has connected to space!");
  let player = new Player(client.id);
  if (team1.players.length <= team2.players.length) {
    player.joinTeam(team1);
    client.team = team1.id;
  } else {
    player.joinTeam(team2);
    client.team = team2.id;
  }

  console.log(teams);

  client.on("rotatingR", bool => {
    let shipToUpdate = searchPlayerShip(client);
    if (bool) {
      shipToUpdate.rotatingR = true;
    } else {
      shipToUpdate.rotatingR = false;
    }
  });

  client.on("rotatingL", bool => {
    let shipToUpdate = searchPlayerShip(client);
    if (bool) {
      shipToUpdate.rotatingL = true;
    } else {
      shipToUpdate.rotatingL = false;
    }
  });

  client.on("thrusting", bool => {
    let shipToUpdate = searchPlayerShip(client);
    if (bool) {
      shipToUpdate.thrusting = true;
    } else {
      shipToUpdate.thrusting = false;
    }
  });

  client.on("shooting", bool => {
    let shipToUpdate = searchPlayerShip(client);
    if (bool) {
      shipToUpdate.shoot();
    }
  });

  /** After disconnect delete client */
  client.on("disconnect", () => {
    for (let t of teams) {
      for (let p = t.players.length - 1; p >= 0; p--) {
        if (t.players[p].id === client.id) {
          t.players.splice(p, 1);
          console.log(teams);
        }
      }
    }
  });
});

function searchPlayerShip(client) {
  let { team, id } = client;
  return teams[team].players.find(x => x.id === id).ship;
}

function prepareDataToSend() {
  let allPlayers = [];
  for (let t of teams) {
    for (let p of t.players) {
      allPlayers.push(p);
    }
  }
  return allPlayers;
}

setInterval(function() {
  for (let t of teams) {
    for (let p of t.players) {
      p.ship.update();
    }
  }
  io.emit("update", prepareDataToSend());
}, 1000 / FPS);

//faster checks
setInterval(function() {
  for (let t of teams) {
    for (let p of t.players) {
      for (let t1 of teams) {
        for (let p1 of t1.players) {
          if(p !== p1 && p.teamId !== p1.teamId){
            p.ship.checkForHit(p1.ship.lasers);
          }
        }
      }
    }
  }
  //
}, 1);
