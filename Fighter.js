const Ship = require('./Ship');

class Fighter extends Ship{
    constructor(teamId){
        super(teamId);
        this.type = "Triangle";
        this.corners = {
            x1: this.x,
            y1: this.y - this.size,
            x2: this.x - Math.sin((60 * Math.PI) / 180) * this.size,
            y2: this.y + this.size / 2,
            x3: this.x + Math.sin((60 * Math.PI) / 180) * this.size,
            y3: this.y + this.size / 2
          };
    }
}

module.exports = Fighter;