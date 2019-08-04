const express = require("express");

const logger = require("./middleware/logger");

const app = express();
const server = require("http").Server(app);

process.env.NODE_CONFIG_DIR = "./server/config";
require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/database")();

/* Server */
const port = process.env.PORT || 5000;
server.listen(port, () => {
  logger.info(`listening on port ${port}...`);
});

const compression = require("compression");
const path = require("path");
app.use(
  express.urlencoded({
    extended: true
  })
);

/**===================SPACE SHIPS========================== */

const io = require("socket.io")(server);
require("../spaceShips/spaceShipsServer")(io);

module.exports = server;

