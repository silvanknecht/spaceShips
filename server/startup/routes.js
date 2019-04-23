const express = require("express");
const path = require("path");

const users = require("../routes/users");
//const page = require("../routes/page");

module.exports = function(app) {
  app.use("/game", express.static("spaceShips/public/game"));
  app.use(express.static("spaceShips/public"));
  app.use(express.json());
  app.use("/api/v1/users", users);
  app.get("/game", function(req, res) {
    var parentDir = path.normalize(__dirname + "/../..");
    res.sendFile(path.join(parentDir + "/spaceShips/public/game/game.html"));
  });
};
