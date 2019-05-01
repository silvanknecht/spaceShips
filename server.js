const express = require("express");
const app = express();
const path = require("path");
const compression = require("compression");
const httpServer = require("http").createServer(app);

// middlewares
app.use(express.json());
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

httpServer.listen(process.env.PORT || 3000, function() {
  console.log("HTTP - Server running at Port 3000");
});

/**===================SPACE SHIPS========================== */

const io = require("socket.io")(httpServer);
require("./spaceShips/spaceShipsServer")(io);

/* Memory usage in MB*/
// setInterval(() => {
//   console.log(process.memoryUsage().heapUsed / 1024 / 1024);
// }, 1000);
