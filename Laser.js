class Laser {
    constructor(x1,y1,shipAngle) {
        this.speed = 0.5;
        this.length = 10;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = this.x1 + this.length * Math.cos(shipAngle);
        this.y2 = this.y1 - this.length* Math.sin(shipAngle);
        this.color = 'rgb(0,255,0)';
    }

    update() {
        this.draw();
        this.move();
    }

    draw() {
        push();
        strokeWeight(4);
        stroke(this.color);
        line(this.x1, this.y1, this.x2, this.y2);
        pop();
    }

    move() {
        let dirVec = [this.x2-this.x1, this.y2-this.y1];
        this.x1 +=  this.speed * dirVec[0];
        this.y1 +=  this.speed * dirVec[1];
        this.x2 +=  this.speed * dirVec[0];
        this.y2 +=  this.speed * dirVec[1];
    }
}