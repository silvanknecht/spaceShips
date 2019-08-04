const logger = require("../server/middleware/logger");

const TeamDeathMatch = require("./servers/teamDeathMatch");
const FreeForAll = require("./servers/freeForAll");

// Width and Height in a resolution of 16:9
global.HEIGHT = 2 * 1080; //4*
global.WIDTH = 2 * 1920; //4*
global.SCOREBOARD_HEIGHT = 40;
global.FPS = 60;
global.FRICTION = 0.7;
global.TIME_DEAD = 3; // in seconds

global.gameServers = { freeForAll: [], teamDeathMatch: [] };
module.exports = function(io) {
  io.on("connection", client => {
    client.on("requestGameServer", gameMode => {
      // send the namespace of the server to the client if there are still spots emty
      let serverFull = false;

      for (let [i, gM] of gameServers[gameMode].entries()) {
        //&&!gS.running  For team deathmatch
        if (gM.playerCount < gM.MAX_PLAYERS && gM.open && !gM.finished) {
          client.emit("newServer", gM.nameSpace);
          return;
        } else if (i === gameServers.length - 1) {
          serverFull = true;
          break;
        }
      }

      // if there is no server yet or all servers are full => open a new Server
      if (gameServers[gameMode].length === 0 || serverFull) {
        if (serverFull) console.log("all server were full");
        let nGS;
        switch (gameMode) {
          case "freeForAll":
            nGS = new FreeForAll(io, `freeForAll${Date.now()}`);
            break;
          case "teamDeathMatch":
            nGS = new TeamDeathMatch(io, `teamDeathMatch${Date.now()}`);
            break;
          default:
            logger.error("No Such server available!");
        }

        gameServers[gameMode].push(nGS);
        client.emit("newServer", nGS.nameSpace);
        serverFull = false;
      }
    });
  });

  setInterval(() => {
    for (let gS in gameServers) {
      for (let gM of gameServers[gS]) {
        if (gM.finished) {
          const connectedNameSpaceSockets = Object.keys(gM.tdm.connected); // Get Object with Connected SocketIds as properties
          connectedNameSpaceSockets.forEach(socketId => {
            gM.tdm.connected[socketId].disconnect(); // Disconnect Each socket
          });
          gM.tdm.removeAllListeners(); // Remove all Listeners for the event emitter
          delete io.nsps[gM.tdm.nameSpace]; // Remove from the server namespaces
          logger.debug("gameServer deleted");
          gameServers[gS].splice(gameServers[gS].indexOf(gM), 1);
        }
      }
    }
  }, 1000);
};
