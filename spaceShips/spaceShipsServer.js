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

global.gameServers = [];
module.exports = function(io) {
  io.on("connection", client => {
    // send the namespace of the server to the client if there are still spots emty
    let serverFull = false;
    for (let [i, gS] of gameServers.entries()) {
      if (gS.playerCount < gS.MAX_PLAYERS && !gS.running) {
        client.emit("newServer", gS.nameSpace);
        return;
      } else if (i === gameServers.length - 1) {
        serverFull = true;
      }
    }

    // if there is no server yet or all servers are full => open a new Server
    if (gameServers.length === 0 || serverFull) {
      if (serverFull) console.log("all server were full");
      let nGS = new GameServer(io, `teamDeathMatch${Date.now()}`);
      gameServers.push(nGS);
      client.emit("newServer", nGS.nameSpace);
      serverFull = false;
    }
  });

  setInterval(() => {
    for (let gS of gameServers) {
      if (gS.finished) {
        const connectedNameSpaceSockets = Object.keys(gS.tdm.connected); // Get Object with Connected SocketIds as properties
        connectedNameSpaceSockets.forEach(socketId => {
          gS.tdm.connected[socketId].disconnect(); // Disconnect Each socket
        });
        gS.tdm.removeAllListeners(); // Remove all Listeners for the event emitter
        delete io.nsps[gS.tdm.nameSpace]; // Remove from the server namespaces
        gameServers.splice(gameServers.indexOf(gS), 1);
      }
    }
  }, 1000);
};
