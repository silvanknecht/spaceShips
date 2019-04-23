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

const path = require("path");
const compression = require("compression");
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(compression());

app.use(express.static("public"));

// index
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
  console.log("hallo");
});

/**===================SPACE SHIPS========================== */

const io = require("socket.io")(server);
require("../spaceShips/spaceShipsServer")(io);

module.exports = server;

/* Memory usage in MB*/
// setInterval(() => {
//   console.log(process.memoryUsage().heapUsed / 1024 / 1024);
// }, 1000);
