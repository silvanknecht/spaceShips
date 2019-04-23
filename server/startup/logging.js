const logger = require("../middleware/logger");

module.exports = function() {
  /* Handle Exceptions */
  process.on("uncaughtException", ex => {
    console.log("uncaught");
    logger.error("uncaught error: ", ex);
    process.exit(1);
  });

  process.on("unhandledRejection", ex => {
    console.log("unahndles");
    logger.error("unhandled error: ", ex);
    process.exit(1);
  });
};
