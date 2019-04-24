const router = require("express-promise-router")();

const validate = require("../middleware/validate");
const { validateShip } = require("../models/ship");
const ShipController = require("../controllers/ships");

router.get("/", ShipController.getAll);
router.post("/", validate(validateShip), ShipController.create);

module.exports = router;
