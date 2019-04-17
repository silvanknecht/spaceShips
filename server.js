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
global.lasers = [];

let clients = [];
const io = require("socket.io")(httpServer);
io.on("connection", client => {
  console.log("New ship has connected to space!");
  let newClient = {
    id: client.id,
    ship: new Ship(200, 200),
    color: getRandomColor(),
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

  client.on("disconnect", () => {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].id === client.id) {
        clients.splice(i, 1);
      }
    }
    console.log(clients.length);
  });
});

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

setInterval(function() {
  for (let c of clients) {
    c.ship.update(lasers);
  }
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].update();
    if (lasers[i].needsDelete) {
        lasers.splice(i, 1);
      }
  }
  io.emit("update", [clients, lasers]);
}, 1000 / FPS);
