const mongoose = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);
const Schema = mongoose.Schema;

// Create a schema
const shipPreferenceSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  shipId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Ship"
  },
  color: {
    type: String,
    required: false,
    default: "black",
    require: true
  },
  kills: {
    type: Number,
    default: 0,
    required: true
  },
  deaths: {
    type: Number,
    default: 0,
    required: true
  }
});

// Create a model
const ShipPreference = mongoose.model("ShipPreference", shipPreferenceSchema); // name will be pluralized automatically for DB

function validateShipPreference(req, res, next) {
  const schema = {
    shipId: Joi.ObjectId().required(),
    color: Joi.string().required(),
    kills: Joi.number()
      .min(0)
      .required(),
    deaths: Joi.number()
      .min(0)
      .required()
  };
  return Joi.validate(req, schema);
}

module.exports = ShipPreference;
module.exports.shipPreferenceSchema = shipPreferenceSchema;
module.exports.validateShipPreference = validateShipPreference;
