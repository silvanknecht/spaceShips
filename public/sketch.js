let clients;
let lasers;
const HEIGHT = 800;
const WIDTH = 1200;
const FPS = 60;

let socket = io("http://146.136.58.104:3000");
socket.on("connect", function() {
  console.log("Connected to Server!");
});
socket.on("event", function(data) {});
socket.on("disconnect", function() {
  socket.close();
});

socket.on("update", data => {
  clients = data[0];
  lasers = data[1];
});

function setup() {
  frameRate(FPS);
  angleMode(DEGREES);
  createCanvas(WIDTH, HEIGHT);
  background(0);
}

function draw() {
  background(0);
  if (clients !== undefined) {
    for (let c of clients) {
      if (!c.ship.isDead) {
        drawShip(c.color, c.ship.corners, c.ship.position, c.ship.r);
      } else {
        if (socket.id === c.id) {
          alert("You got killed, reload browser for another round!");
        }
      }
      drawHealth(c.id, c.color, c.ship.health);
    }
  }
  if (lasers !== undefined) {
    for (let l of lasers) {
      drawLaser(l);
    }
  }
  keyDown();
}

function drawShip(color, corners) {
  let { x1, x2, x3, y1, y2, y3 } = corners;
  push();
  fill(color);
  triangle(x1, y1, x2, y2, x3, y3);
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

function drawHealth(id, color, health) {
  if (id === socket.id) {
    push();
    fill(color);
    textSize(16);
    text("Your health: " + health, WIDTH - 200, HEIGHT - 20);
    pop();
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
