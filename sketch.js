let ship1;
const FPS = 60;
const FRICTION = 0.7;

function setup() {
  angleMode(DEGREES);
  createCanvas(1200, 800);
  background(0);
  ship1 = new Ship(200, 200);
  console.log(ship1);
}

function draw() {
  background(0);
  ship1.draw();
  ship1.update();
  keyDown();

}

function keyDown() {
  if (keyIsDown(LEFT_ARROW)) {
    ship1.rotatingR = true;
  } else if (keyIsDown(RIGHT_ARROW)) {
    ship1.rotatingL = true;
  } else if (keyIsDown(UP_ARROW)) {
    ship1.thrusting = true;
  } else {
    ship1.thrusting = false;
    ship1.rotatingR = false;
    ship1.rotatingL = false;
  }
}

function keyPressed() {
  if (keyCode === 32) {
    ship1.shoot();
  }
}
