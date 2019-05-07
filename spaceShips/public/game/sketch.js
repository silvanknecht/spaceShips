let teams;
let items;
let time;
let canvas;
let width;
let height;
let diffy = 0;
let diffx = 0;

const FIELDCOUNT = 4; // the battlefield consists of 4 1920x1080 sized rectangles
const SCOREBOARD_HIGHT = 40;
const PLAYFIELDHIGHT = 1080;
const HEIGHT = PLAYFIELDHIGHT + SCOREBOARD_HIGHT;
const WIDTH = 1920;
const FPS = 60;
let middle = { x: WIDTH / 2, y: PLAYFIELDHIGHT / 2 + SCOREBOARD_HIGHT };

/** Background */
let stars = [];
const STARS = FIELDCOUNT * 2000;

window.onload = function() {
  canvas = document.getElementsByTagName("canvas")[0];
  resizeCanv();
};
window.onresize = function() {
  resizeCanv();
};

function resizeCanv() {
  width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  canvas.style.width = width - 20 + "px";
  canvas.style.height = height - 27 + "px";
}
let socket = io("https://realspaceships.herokuapp.com", {
  transports: ["websocket"],
  upgrade: false
});
socket.on("connect", function() {
  console.log("Connected to Server!");
  socket.emit("registerForGame", jwtToken);
});

socket.on("disconnect", function() {
  socket.removeAllListeners();
  socket.close();
});

socket.on("update", data => {
  teams = data.teams;
  items = data.items;
});

socket.on("serverInfo", data => {
  if (data === "serverFull") {
    alert("Server already full, please try again later!");
  } else if (data === "existsAlready") {
    alert("You're already in the game!");
  } else if (data === "tokenExpired") {
    window.location.href = url;
  }
});

socket.on("gameEnd", data => {
  window.location.replace(url + "interface/index.html");
  alert(data);
});

socket.on("serverTime", data => {
  time = data;
});

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

  /** Background */
  push();
  translate(0-diffx, SCOREBOARD_HIGHT-diffy);
  for (let i = 0; i < STARS; i++) {
    stars[i].update();
  }
  pop();

  if (teams !== undefined) {
    if (items !== undefined) {
      drawItems();
    }
    for (let t of teams) {
      if (t.players.length > 0) {
        for (let p of t.players) {
          if (p.ship !== undefined) {
            // bc when a player joins the ship can be undefined in the beginning
            if (!p.ship.isDead) {
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
        }

        if (myShip !== undefined) {
          //if (myShip.position.x > middle.x) {
            diffx = myShip.position.x - middle.x;
         // } else {
          //   diffx = 0;
          // }

          // if (myShip.position.y > middle.y) {
            diffy = myShip.position.y - middle.y;
          // } else {
          //   diffy = 0;
          // }

          drawShip(myShip, myTcolor);
        }
      }
    }
    keyDown();
    /** Scorebaord */
    fill("#505050");
    rect(0, 0, WIDTH, SCOREBOARD_HIGHT);
    drawTickets();
    if (time !== undefined) {
      drawTime();
    }
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
    position: { y },
    shield: { hitpoints, maxHitpoints }
  } = ship;

  // draw ship Body
  let { x1, x2, x3, y1, y2, y3 } = corners;
  push();
  strokeWeight(2);
  stroke(color);
  fill(tcolor);
  triangle(
    x1 - diffx,
    y1 - diffy,
    x2 - diffx,
    y2 - diffy,
    x3 - diffx,
    y3 - diffy
  );
  pop();

  // draw shield
  if (hitpoints > 0) {
    let shieldDensity = map(hitpoints, 0, maxHitpoints, 0, 180);
    push();
    fill(0, 0, 255, shieldDensity);
    ellipse(x - diffx, y - diffy, size * 3);
    pop();
  }

  // draw Ship health
  let healthDraw = map(health, 0, 100, 0, 30);
  push();
  fill("#FF0000");
  rect(x - diffx - healthDraw / 2, y - diffy - size - 15, healthDraw, 2.5);
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
  line(x1 - diffx, y1 - diffy, x2 - diffx, y2 - diffy);
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

function drawTime() {
  push();
  fill("#F55AC");
  textSize(16);
  text(time, width / 2, 20);
  pop();
}

function drawItems() {
  for (let i of items) {
    push();
    fill("#0000FF");
    ellipse(i.position.x, i.position.y, i.d / 2);
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
