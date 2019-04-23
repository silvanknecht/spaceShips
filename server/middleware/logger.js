const winston = require("winston");
const { createLogger, format, transports } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  transports: [
    // all messages until info will be stored in the info-log-file
    new transports.File({
      filename: "./authentication_info.log",
      level: "info"
    }),
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.simple()
      )
    })
  ]
});
// all error messages will be stored in the database
logger.add(
  new winston.transports.MongoDB({
    db: "mongodb://localhost/APIAuthentication",
    level: "error"
  })
);

module.exports = logger;
