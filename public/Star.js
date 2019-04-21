class Star {
  constructor() {
    this.x = Math.random() * WIDTH;
    this.y =
      Math.random() * (HEIGHT - SCOREBOARD_HIGHT) +
      SCOREBOARD_HIGHT;

    this.d = Math.random() * (1.5 - 0.5) + 0.5;
  }

  update() {
    this.draw();
  }

  draw() {
    noStroke();
    fill("#FFF");
    ellipse(this.x, this.y, this.d / 2);
  }
}
