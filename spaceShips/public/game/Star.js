class Star {
  constructor() {
    this.x = Math.random() * FIELDCOUNT * WIDTH;
    this.y =
      Math.random() * (FIELDCOUNT*HEIGHT-100 - SCOREBOARD_HIGHT) +
      SCOREBOARD_HIGHT-100;
    this.noneBlinkSize = Math.random() * (3.5 - 0.5) + 0.5;
    this.d = this.noneBlinkSize;
    this.blinkSize = this.noneBlinkSize + 10;
    this.timeTillBlink = (Math.random() * (STARS - 5) + 5) *FPS;

  }

  update() {
    this.draw();
    this.blink();
  }

  draw() {
    noStroke();
    fill("#FFF");
    ellipse(this.x, this.y, this.d / 2);
  }

  blink(){

    if(this.timeTillBlink <= 0){
        this.d = this.blinkSize;
      this.timeTillBlink = (Math.random() * (STARS - 5) + 5) *FPS;
    }else{
      this.d = this.noneBlinkSize;
      this.timeTillBlink--;
    }
  }


}
