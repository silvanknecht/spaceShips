const router = require("express-promise-router")();
const path = require("path");

router.get("/", () => {
  var parentDir = path.normalize(__dirname + "/../..");
  res.sendFile(path.join(parentDir + "/spaceShips/public/login/index.html"));
});

module.exports = router;
