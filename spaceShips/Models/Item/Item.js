class Item {
  constructor(name) {
    if (new.target === Item) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.name = name;
    this.position = {
      x: Math.random() * (WIDTH - 50 - 50) + 50,
      y:
        Math.random() * (HEIGHT - 100 - SCOREBOARD_HEIGHT + 50) +
        SCOREBOARD_HEIGHT +
        50
    };
  }

  pickedUp() {
    let i = items.indexOf(this);
    items.splice(i, 1);
  }
}

module.exports = Item;
