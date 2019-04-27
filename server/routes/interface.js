const router = require("express-promise-router")();
const logger = require("../middleware/logger");
const path = require("path");

router.get("/", () => {
  logger.debug("route '/interface/' got called;");
  var parentDir = path.normalize(__dirname + "/../..");
  res.sendFile(path.join(parentDir + "/spaceShips/public/interface/main.html"));
});

module.exports = router;
