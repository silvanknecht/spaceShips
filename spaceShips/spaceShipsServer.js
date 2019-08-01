const jwt = require("jsonwebtoken");
const config = require("config");
const logger = require("../server/middleware/logger");

const GameServer = require("./servers/gameServer");

// Width and Height in a resolution of 16:9
global.HEIGHT = 2 * 1080; //4*
global.WIDTH = 2 * 1920; //4*
global.SCOREBOARD_HEIGHT = 40;
global.FPS = 60;
global.FRICTION = 0.7;
global.TIME_DEAD = 3; // in seconds

let gameServers = [];
module.exports = function(io) {
  io.on("connection", client => {
    // send the namespace of the server to the client if there are still spots emty
    let serverFull = false;
    for (let [i, gS] of gameServers.entries()) {
      if (gS.playerCount < gS.MAX_PLAYERS) {
        client.emit("newServer", gS.nameSpace);
        return;
      } else if (i === gameServers.length - 1) {
        serverFull = true;
      }
    }

    //TODO: length is not good, in case the servers are also automatically closed when not used anymore!
    // if there is no server yet or all servers are full => open a new Server
    if (gameServers.length === 0 || serverFull) {
      if (serverFull) console.log("all server were full");
      let nGS = new GameServer(io, `teamDeathMatch${gameServers.length}`);
      gameServers.push(nGS);
      client.emit("newServer", nGS.nameSpace);
      serverFull = false;
    }
  });
};
