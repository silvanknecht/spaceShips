const Item = require("./Item");

class Shield extends Item {
  constructor() {
    super("shield");
    this.hitpoints = 30;
    this.maxHitpoints = 30;
    this.d = 100;
  }
}

module.exports = Shield;
