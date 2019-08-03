const mongoose = require("mongoose");
const config = require("config");

const logger = require("../middleware/logger");

module.exports = function() {
  const db = config.get("gameDb");
  var str = db;
  str = str.replace(/\/\/.*@/, "//***:***@"); // replace credentials with stars
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useFindAndModify: false
    })
    .then(logger.info(`Connected to Database at ${str}`));
  mongoose.set("useCreateIndex", true); // Without it Deprication Warning
};
