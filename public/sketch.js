let teams;
const SCOREBOARD_HIGHT = 40;
const HEIGHT = 800 + SCOREBOARD_HIGHT;
const WIDTH = 1200;
const FPS = 60;
let socket = io("http://localhost:3000");
socket.on("connect", function() {
  console.log("Connected to Server!");
});
socket.on("event", function(data) {});
socket.on("disconnect", function() {
  socket.close();
});

socket.on("update", data => {
  teams = data.teams;
});

socket.on("serverInfo", data => {
  if (data === "serverFull") {
    alert("Server already full, please try again later!");
  }
});

socket.on("gameEnd", data => {
  alert("Team: " + data + " won the game! Reload Browser for a new game!");
});
let stars = [];
const STARS = 500;
function setup() {
  frameRate(FPS);
  angleMode(DEGREES);
  createCanvas(WIDTH, HEIGHT);
  background(0);
  for (let i = 0; i < STARS; i++) {
    stars.push(new Star());
  }
}

/**Paint health and make sure the players ship is always on top */
function draw() {
  let myShip;
  let myTcolor;
  background(0);

  fill("#505050");
  rect(0, 0, WIDTH, SCOREBOARD_HIGHT);

  if (teams !== undefined) {
    for (let t of teams) {
      if (t.players.length > 0) {
        for (let p of t.players) {
          if (!p.isDead) {
            for (let l of p.ship.lasers) {
              drawLaser(l);
            }

            if (p.id === socket.id) {
              myShip = p.ship;
              myTcolor = t.color;
            } else {
              drawShip(p.ship, t.color);
            }

            drawHealth(p);
          } else {
            if (socket.id === p.id) {
              console.log("You got killed");
            }
          }
        }

        if (myShip !== undefined) {
          drawShip(myShip, myTcolor);
        }
      }
    }
    keyDown();
    drawTickets();
  }

  /** Background */
  for (let i = 0; i < STARS; i++) {
    stars[i].update();
  }
}

function drawShip(ship, tcolor) {
  push();
  translate(0, SCOREBOARD_HIGHT);
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
  strokeWeight(2);
  stroke(color);
  fill(tcolor);
  triangle(x1, y1, x2, y2, x3, y3);
  pop();

  // draw Ship health
  let healthDraw = map(health, 0, 100, 0, 30);
  push();
  fill("#FF0000");
  rect(x - healthDraw / 2, y - size - 15, healthDraw, 2.5);
  pop();
  pop();
}

function drawLaser(laser) {
  push();
  translate(0, SCOREBOARD_HIGHT);
  let { color } = laser;
  let { x1, x2, y1, y2 } = laser.position;
  push();
  strokeWeight(4);
  stroke(color);
  line(x1, y1, x2, y2);
  pop();
  pop();
}

function drawHealth(c) {
  push();
  translate(0, SCOREBOARD_HIGHT);
  let {
    id,
    ship: { color },
    ship: { health }
  } = c;
  if (id === socket.id) {
    push();
    fill(color);
    textSize(16);
    text("Your health: " + health, WIDTH - 200, HEIGHT - 20 - SCOREBOARD_HIGHT);
    pop();
  }
  pop();
}

function drawTickets() {
  let x = 10;
  for (let t of teams) {
    push();
    fill(t.color);
    textSize(16);
    text("Tickets " + t.tickets, x, 20);
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
