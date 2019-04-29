const ShipPreference = require("../models/shipPreferences");

const logger = require("../middleware/logger");

module.exports = {
  update: async function(req, res, next) {
    logger.debug("Update shippreference");
    let { _id } = req.user._id;
    let { shipId } = req.params;
    let { color, kills, deaths } = req.body;
    await ShipPreference.updateOne(
      { userId: _id, shipId },
      { color, $inc: { kills: kills }, $inc: { deaths: deaths } }
    );

    res.status(200).json({
      message: "Ship Preference has been updated sucessfully!"
    });
  }
};
