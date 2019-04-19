const Ship = require('./Ship');

class Fighter extends Ship{
    constructor(x,y){
        super(x,y);
        this.type = "Triangle";
        this.corners = {
            x1: x,
            y1: y - this.size,
            x2: x - Math.sin((60 * Math.PI) / 180) * this.size,
            y2: y + this.size / 2,
            x3: x + Math.sin((60 * Math.PI) / 180) * this.size,
            y3: y + this.size / 2
          };
    }
}

module.exports = Fighter;