let ship1;
const FPS = 60;
const FRICTION = 0.7;

function setup() {
  angleMode(DEGREES);
  createCanvas(600, 600);
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
    ship1.rotation += ((ship1.TURN_SPEED / 180) * Math.PI) / FPS;
  } else if (keyIsDown(RIGHT_ARROW)) {
    ship1.rotation -= ((ship1.TURN_SPEED / 180) * Math.PI) / FPS;
  } else if (keyIsDown(UP_ARROW)) {
    ship1.thrusting = true;
  } else {
    ship1.thrusting = false;
  }
}
