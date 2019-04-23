const mongoose = require("mongoose");
const Joi = require("joi");

const Schema = mongoose.Schema;

// Create a schema
const shipSchema = new Schema({
  // Additional validation, it's also done serverside!
  name: {
    type: String,
    required: true
  },
  health: {
    type: Number,
    required: true
  },

});

// userSchema.methods.isValidPassword = async function(passwordToCheck) {
//   return await bcrypt.compare(passwordToCheck, this.local.password);
// };

// userSchema.methods.generateAuthToken = function() {
//   const token = JWT.sign(
//     {
//       iss: "NodeJs_Authentification",
//       sub: this,
//       iat: new Date().getTime(),
//       exp: new Date().setDate(new Date().getDate() + 1) // current date + 1 day
//     },
//     config.get("jwtSecret")
//   );
//   return token;
// };
// // Create a model
// const User = mongoose.model("User", userSchema); // name will be pluralized automatically for DB

// function validateCredentials(req, res, next) {
//   const schema = {
//     email: Joi.string()
//       .email()
//       .required(),
//     password: Joi.string().required()
//   };
//   return Joi.validate(req, schema);
// }

// // Export the model
// module.exports = User;
// module.exports.validateCredentials = validateCredentials;
