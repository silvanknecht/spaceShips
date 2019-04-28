const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Joi = require("joi");
const JWT = require("jsonwebtoken");
const config = require("config");

const Schema = mongoose.Schema;

const logger = require("../middleware/logger");
const Ship = require("./ship");

// Create a schema
// TODO: Add other fields: lastname, firstname, birthday, etc.
const userSchema = new Schema({
  // Additional validation, it's also done serverside!
  methodes: {
    type: [String],
    enum: ["local", "google", "facebook", "github"],
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  local: {
    password: {
      type: String
    }
  },
  google: {
    id: {
      type: String
    }
  },
  facebook: {
    id: {
      type: String
    }
  },
  github: {
    id: {
      type: String
    }
  },
  role: {
    type: [String],
    enum: ["user", "admin"],
    required: true,
    default: ["user"]
  }
});

userSchema.methods.isValidPassword = async function(passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.local.password);
};

userSchema.methods.generateAuthToken = function() {
  const token = JWT.sign(
    {
      iss: "NodeJs_Authentification",
      sub: this,
      iat: new Date().getTime(),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // current date + 1 hour
    },
    config.get("jwtSecret")
  );
  return token;
};
// Create a model
const User = mongoose.model("User", userSchema); // name will be pluralized automatically for DB

function validateCredentials(req, res, next) {
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  };
  return Joi.validate(req, schema);
}

// Export the model
module.exports = User;
module.exports.validateCredentials = validateCredentials;
