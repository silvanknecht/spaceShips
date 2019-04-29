const router = require("express-promise-router")();
const passport = require("passport");

const validate = require("../middleware/validate");
const { validateShipPreference } = require("../models/shipPreferences");
const ShipPreferencesController = require("../controllers/shipPreferences");
const { isAdmin } = require("../middleware/roles");

const passportJWT = passport.authenticate("jwt", {
  session: false
});

router.put(
  "/:shipId",
  validate(validateShipPreference),
  passportJWT,
  isAdmin,
  ShipPreferencesController.update
);

module.exports = router;
