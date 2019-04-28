const router = require("express-promise-router")();
const passport = require("passport");

const validate = require("../middleware/validate");
const { validateShip } = require("../models/ship");
const ShipController = require("../controllers/ships");

//require("../middleware/passport");

const passportJWT = passport.authenticate("jwt", {
  session: false
});
const { isAdmin } = require("../middleware/roles");

router.get("/", ShipController.getAll);
router.post(
  "/",
  validate(validateShip),
  passportJWT,
  isAdmin,
  ShipController.create
);

module.exports = router;
