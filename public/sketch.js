let clients;
let tickets;
const HEIGHT = 800;
const WIDTH = 1200;
const FPS = 60;
const colors = ["#ffff00", "#FF00FF"];
let socket = io("http://192.168.0.10:3000");
socket.on("connect", function() {
  console.log("Connected to Server!");
});
socket.on("event", function(data) {});
socket.on("disconnect", function() {
  socket.close();
});

socket.on("update", data => {
  clients = data.allPlayers;
  tickets = data.teamScores;
  console.log(data);
});

socket.on("serverInfo", data => {
  if (data === "serverFull") {
    alert("Server already full, please try again later!");
  }
});

socket.on("gameEnd", data => {
  alert("Team: " + data + " won the game! Reload Browser for a new game!");
});

function setup() {
  frameRate(FPS);
  angleMode(DEGREES);
  createCanvas(WIDTH, HEIGHT);
  background(0);
}

/**Paint health and make sure the players ship is always on top */
function draw() {
  let myShip;
  let myTcolor;
  background(0);
  if (clients !== undefined) {
    for (let c of clients) {
      if (!c.isDead) {
        for (let l of c.ship.lasers) {
          drawLaser(l);
        }

        if (c.id === socket.id) {
          myShip = c.ship;
          myTcolor = colors[c.teamId];
        } else {
          drawShip(c.ship, colors[c.teamId]);
        }
        drawHealth(c);
      } else {
        if (socket.id === c.id) {
          console.log("You got killed");
        }
      }
    }
    if (myShip !== undefined) {
      drawShip(myShip, myTcolor);
    }
  }
  keyDown();
  if (tickets !== undefined) {
    drawTickets();
  }
}

function drawShip(ship, tcolor) {
  let {
    size,
    color,
    corners,
    health,
    position: { x },
    position: { y }
  } = ship;

  // draw ship Body
  let { x1, x2, x3, y1, y2, y3 } = corners;
  push();
  stroke(tcolor);
  fill(color);
  triangle(x1, y1, x2, y2, x3, y3);
  pop();

  // draw Ship health
  let healthDraw = map(health, 0, 100, 0, 30);
  push();
  fill("#FF0000");
  rect(x - healthDraw / 2, y - size - 15, healthDraw, 2.5);
  pop();
}

function drawLaser(laser) {
  let { color } = laser;
  let { x1, x2, y1, y2 } = laser.position;
  push();
  strokeWeight(4);
  stroke(color);
  line(x1, y1, x2, y2);
  pop();
}

function drawHealth(c) {
  let {
    id,
    ship: { color },
    ship: { health }
  } = c;
  if (id === socket.id) {
    push();
    fill(color);
    textSize(16);
    text("Your health: " + health, WIDTH - 200, HEIGHT - 20);
    pop();
  }
}

function drawTickets() {
  let x = 10;
  for (let [i, t] of tickets.entries()) {
    push();
    fill(colors[i]);
    textSize(16);
    text("Tickets " + t, x, 20);
    pop();
    x = WIDTH - 100;
  }
}

function keyDown() {
  if (keyIsDown(LEFT_ARROW)) {
    socket.emit("rotatingR", true);
  } else {
    socket.emit("rotatingR", false);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    socket.emit("rotatingL", true);
  } else {
    socket.emit("rotatingL", false);
  }
  if (keyIsDown(UP_ARROW)) {
    socket.emit("thrusting", true);
  } else {
    socket.emit("thrusting", false);
  }
}

function keyPressed() {
  if (keyCode === 32) {
    socket.emit("shooting", true);
  }
}
