const express = require("express");
const path = require("path");

const users = require("../routes/users");
const ships = require("../routes/ships");
const shipPreferences = require("../routes/shipPreferences");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/v1/users", users);
  app.use("/api/v1/ships", ships);
  app.use("/api/v1/shipPreferences", shipPreferences);

  app.use(express.static("spaceShips/public"));
  app.get("/", function(req, res) {
    var parentDir = path.normalize(__dirname + "/../..");
    res.sendFile(path.join(parentDir + "/spaceShips/public/index.html"));
  });
  app.use("/game", express.static("spaceShips/public/game"));
  app.get("/game/teamdeathmatch", function(req, res) {
    var parentDir = path.normalize(__dirname + "/../..");
    res.sendFile(path.join(parentDir + "/spaceShips/public/game/teamdeathmatch.html"));
  });
  app.get("/game/freeforall", function(req, res) {
    var parentDir = path.normalize(__dirname + "/../..");
    res.sendFile(path.join(parentDir + "/spaceShips/public/game/freeforall.html"));
  });
  app.get("/interface", function(req, res) {
    var parentDir = path.normalize(__dirname + "/../..");
    res.sendFile(
      path.join(parentDir + "/spaceShips/public/interface/interface.html")
    );
  });
};
