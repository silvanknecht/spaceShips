const router = require("express-promise-router")();
const logger = require("../middleware/logger");

router.get("/", () => {
  logger.debug("route '/game/' got called;")
  var parentDir = path.normalize(__dirname + "/../..");
  res.sendFile(path.join(parentDir + "/spaceShips/public/game/game.html"));
});

module.exports = router;
