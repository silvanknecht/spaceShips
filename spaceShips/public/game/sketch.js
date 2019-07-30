let teams;
let items;
let time;
let canvas;
let width;
let height;
let diffy = 0;
let diffx = 0;
let mX = 0; // mouseX
let mY = 0; // mouseY
let killFeed = [];
let minimapContent = [];
let lasers = [];
let gotHit = false;

const MINIMAPTOBOARDER = 10;
const FIELDCOUNT = 2; // the battlefield consists of 4 1920x1080 sized rectangles
const SCOREBOARD_HIGHT = 40;
const CANVASHIGHT = 1040;
const HEIGHT = CANVASHIGHT + SCOREBOARD_HIGHT;
const WIDTH = 1920;
const FPS = 60;
let middle = { x: WIDTH / 2, y: CANVASHIGHT / 2 + SCOREBOARD_HIGHT };

/** Background */
let stars = [];
const STARS = 1 * 500; //TODO: performance loss if to many stars... maybe static (gif) background!

window.onload = function() {
  fetch("crosshairs/cursor1.cur", function() {
    // Do other processing here
  });
  canvas = document.getElementsByTagName("canvas")[0];
  resizeCanv();
};
window.onresize = function() {
  resizeCanv();
};

/** Make canv fit fullscreen for every browser in resolution 16:9 */
function resizeCanv() {
  width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
}
let socket = io(url, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  upgrade: false
});
socket.on("connect", function() {
  console.log("Connected to Server!");
  socket.emit("registerForGame", jwtToken);
});

socket.on("disconnect", function() {
  console.log("disconnected from server");
  //window.setTimeout("app.connect()", 5000);
});

socket.on("update", data => {
  teams = data.teams;
  items = data.items;
  //console.log("Teams: ", teams);

  let x = mX - WIDTH / 2;
  let y = mY - HEIGHT / 2 - SCOREBOARD_HIGHT - 20;
  socket.emit("turn", Math.atan2(y, x) * -1);
});

socket.on("laserFired", data => {
  let { laser, reloading } = data;

  if (reloading) return;
  if (myShip !== undefined) {
    let longestDistance = 2000;
    let diff = Math.sqrt(
      (laser.position.x1 - myShip.position.x) ** 2 +
        (laser.position.y1 - myShip.position.y) ** 2
    );
    let volume = map(diff, 0, longestDistance, 0.5, 0);
    if (volume < 0) {
      volume = 0;
    }

    push();
    laserSound.setVolume(volume);
    laserSound.play();
    pop();
  }
  lasers.push(laser);
});

socket.on("laserHit_laserToDelete", laser => {
  // if it was your laser flash hitmarker
  if (myShip !== undefined) {
    if (laser.userId === myShip.userId && !myShip.reloading) {
      canvas.style.cursor = "url('crosshairs/cursor1.cur') 16 16,auto";
      setTimeout(() => {
        canvas.style.cursor = "url('crosshairs/cursor2.cur') 16 16,auto";
      }, 50);
    }
  }

  // the laser is already updated on servers side so it needs to be changed back
  laser.needsDelete = false;
  for (let l of lasers) {
    if (JSON.stringify(l) === JSON.stringify(laser)) {
      l.needsDelete = true;
    }
  }
});

// TODO: change to switch case
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

socket.on("killFeed", data => {
  if (killFeed.length > 4) {
    killFeed.splice(0, 1);
  }
  killFeed.push(data);
});

socket.on("gotHit", data => {
  let { hit } = data;
  if (myShip !== undefined) {
    if (hit === myShip.userId) {
      gotHit = true;
      setTimeout(() => {
        gotHit = false;
      }, 100);
    }
  }
});

let laserSound;
function setup() {
  laserSound = loadSound("/sounds/laser.mp3");
  frameRate(FPS);
  angleMode(DEGREES);
  createCanvas(WIDTH, HEIGHT);
  background(0);
  for (let i = 0; i < STARS; i++) {
    stars.push(new Star());
  }
  mX = mouseX;
  mY = mouseY;
}
let myShip;

/**Paint health and make sure the players ship is always on top */
function draw() {
  mX = mouseX;
  mY = mouseY;
  myShip = undefined; // with out this the game brakes
  let myTcolor;
  background(200);
  push();
  translate(-diffx, SCOREBOARD_HIGHT - diffy);
  if (gotHit) {
    fill(150, 0, 0, 200);
  } else {
    fill(0);
  }
  rect(0, 0, FIELDCOUNT * WIDTH, FIELDCOUNT * HEIGHT);
  pop();
  /** Background */
  push();
  translate(0 - diffx, SCOREBOARD_HIGHT - diffy);
  for (let i = 0; i < STARS; i++) {
    stars[i].update();
  }
  pop();

  if (items !== undefined) {
    drawItems();
  }

  for (let l of lasers) {
    drawLaser(l);
    moveLaser(l);
    deleteLaser(l);
  }

  // SHIPS
  minimapContent = [];
  if (teams !== undefined) {
    for (let t of teams) {
      if (t.players.length > 0) {
        for (let p of t.players) {
          if (p.ship !== undefined) {
            // bc when a player joins the ship can be undefined in the beginning
            if (!p.ship.isDead) {
              if (p.id === socket.id) {
                myShip = p.ship;
                myTcolor = t.color;
              } else {
                drawShip(p.ship, t.color);

                minimapContent.push({ ship: p.ship, color: t.color });
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
          // }

          drawShip(myShip, myTcolor);
          minimapContent.push({ ship: myShip, color: "#32CD32" }); // show myself greeen on the minimap
        }
      }
    }
    keyDown();
    /** Scorebaord */
    push();
    fill("#505050");
    rect(0, 0, WIDTH, SCOREBOARD_HIGHT);
    pop();
    drawTickets();
    if (time !== undefined) {
      drawTime();
    }

    let s = 0;
    for (let i = killFeed.length - 1; i >= 0; i--) {
      push();
      textAlign(RIGHT);
      fill(255);
      textSize(16);
      text(
        killFeed[i].killer.name + " => " + killFeed[i].corps.name,
        WIDTH - 20,
        SCOREBOARD_HIGHT + 20 + 16 * s
      );
      s++;
      pop();
    }
  }

  drawMinimap();
}

function drawShip(ship, tcolor) {
  push();
  translate(0 - diffx, SCOREBOARD_HIGHT - diffy);
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
  triangle(x1, y1, x2, y2, x3, y3);
  pop();

  // draw shield
  if (hitpoints > 0) {
    let shieldDensity = map(hitpoints, 0, maxHitpoints, 0, 180);
    push();
    fill(0, 0, 255, shieldDensity);
    ellipse(x, y, size * 3);
    pop();
  }

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
  translate(0 - diffx, SCOREBOARD_HIGHT - diffy);
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
    text("Your health: " + health, WIDTH - 200, HEIGHT - 60);
    pop();
  }
  pop();
}

function drawMinimap() {
  // MINIMAP BACKGROUND
  push();
  translate(0 + MINIMAPTOBOARDER, HEIGHT - 202.5 - MINIMAPTOBOARDER);
  fill(150);
  rect(0, 0, 360, 202.5);
  pop();

  for (let mc of minimapContent) {
    let { ship, color } = mc;
    drawShipOnMinimap(ship, color);
  }
}

function drawShipOnMinimap(ship, color) {
  push();
  translate(0 + MINIMAPTOBOARDER, HEIGHT - 202.5 - MINIMAPTOBOARDER);
  let {
    position: { x },
    position: { y }
  } = ship;

  let xOnMinimap = map(x, 0, FIELDCOUNT * WIDTH, 0, 360);
  let yOnMinimap = map(y, 0, FIELDCOUNT * HEIGHT, 0, 202.5);

  fill(color);
  ellipse(xOnMinimap, yOnMinimap, 10);
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
  text(time, WIDTH / 2, 20);
  pop();
}

function drawItems() {
  for (let i of items) {
    push();
    translate(0 - diffx, SCOREBOARD_HIGHT - diffy);
    fill("#0000FF");
    ellipse(i.position.x, i.position.y, i.d / 2);
    pop();
  }
}

function keyDown() {
  if (keyIsDown(87)) {
    socket.emit("thrusting", true);
  } else {
    socket.emit("thrusting", false);
  }
}

function mouseClicked() {
  socket.emit("shooting", true);
}

/** LASERS */
function deleteLaser() {
  for (let i = lasers.length - 1; i >= 0; i--) {
    if (lasers[i].needsDelete) {
      lasers.splice(i, 1);
    }
  }
}

function moveLaser(laser) {
  // check if laser has traveled max distance
  if (
    laser.position.x1 > laser.spapwnPos.x1 + laser.maxDist ||
    laser.position.x1 < laser.spapwnPos.x1 - laser.maxDist ||
    laser.position.y1 > laser.spapwnPos.y1 + laser.maxDist ||
    laser.position.y1 < laser.spapwnPos.y1 - laser.maxDist
  ) {
    laser.needsDelete = true;
  } else {
    // check if laser has left screen
    if (
      laser.position.x1 > FIELDCOUNT * WIDTH ||
      laser.position.x1 < 0 ||
      laser.position.x2 > FIELDCOUNT * WIDTH ||
      laser.position.x2 < 0 ||
      laser.position.y1 > FIELDCOUNT * HEIGHT ||
      laser.position.y1 < 0 ||
      laser.position.y2 > FIELDCOUNT * HEIGHT ||
      laser.position.y2 < 0
    ) {
      laser.needsDelete = true;
    }
  }

  laser.position.x1 += (laser.speed.x / FPS) * laser.unitVector[0];
  laser.position.y1 += (laser.speed.y / FPS) * laser.unitVector[1];
  laser.position.x2 += (laser.speed.x / FPS) * laser.unitVector[0];
  laser.position.y2 += (laser.speed.y / FPS) * laser.unitVector[1];
}

/** LATENCY CLIENTSIDE**/
var startTime;

setInterval(function() {
  startTime = Date.now();
  socket.emit("p1ng");
  console.log("Ping sent!");
}, 1000);

socket.on("p0ng", function() {
  latency = Date.now() - startTime;
  console.log("Ping: ", latency);
});
