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
const Ship = require("./Ship");

global.HEIGHT = 800;
global.WIDTH = 1200;
global.FPS = 60;
global.FRICTION = 0.7;
global.TIME_DEAD = 3; // in seconds

let clients = [];
const io = require("socket.io")(httpServer);
io.on("connection", client => {
  console.log("New ship has connected to space!");
  let newClient = {
    id: client.id,
    ship: new Ship(200, 200),
    name: "Anonymous"
  };
  clients.push(newClient);
  console.log(clients);

  client.on("rotatingR", bool => {
    let shipToUpdate = clients.find(x => x.id === client.id).ship;
    if (bool) {
      shipToUpdate.rotatingR = true;
    } else {
      shipToUpdate.rotatingR = false;
    }
  });

  client.on("rotatingL", bool => {
    let shipToUpdate = clients.find(x => x.id === client.id).ship;
    if (bool) {
      shipToUpdate.rotatingL = true;
    } else {
      shipToUpdate.rotatingL = false;
    }
  });

  client.on("thrusting", bool => {
    let shipToUpdate = clients.find(x => x.id === client.id).ship;
    if (bool) {
      shipToUpdate.thrusting = true;
    } else {
      shipToUpdate.thrusting = false;
    }
  });

  client.on("shooting", bool => {
    let shipToUpdate = clients.find(x => x.id === client.id).ship;
    if (bool) {
      shipToUpdate.shoot();
    }
  });

  /** After disconnect delete client */
  client.on("disconnect", () => {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].id === client.id) {
        clients.splice(i, 1);
      }
    }
  });
});



setInterval(function() {
  for (let c of clients) {
    c.ship.update();
  }
  io.emit("update", clients);
}, 1000 / FPS);

// faster checks
setInterval(function() {
  for (let c of clients) {
    for (let i of clients) {
      if (i !== c) {
        c.ship.checkForHit(i.ship.lasers);
      }
    }
  }
}, 10);


