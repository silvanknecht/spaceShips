const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

// Create a schema
const shipSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  color: {
    type: String,
    default: "black"
  },
  health: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
});

// Create a model
const Ship = mongoose.model("Ship", shipSchema); // name will be pluralized automatically for DB

function validateShip(req, res, next) {
  const schema = {
    name: Joi.string().required(),
    color: Joi.string(),
    health: Joi.number().required(),
    size: Joi.number().required()
  };
  return Joi.validate(req, schema);
}

// // Export the model
module.exports = Ship;
module.exports.validateShip = validateShip;
