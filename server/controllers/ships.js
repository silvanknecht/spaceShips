const Ship = require("../models/ship");
const logger = require("../middleware/logger");

module.exports = {
  getAll: async function(req, res, next) {
    logger.debug('Get all ships called!');
    const ships = await Ship.find({});
    res.status(200).json({
        ships
      });
  },
  create: async function(req, res, next) {
    logger.debug('Create ship called!');


    res.status(200).json({
      
      });
  }
};
