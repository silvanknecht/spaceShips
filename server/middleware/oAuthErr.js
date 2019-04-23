const logger = require("./logger");

module.exports = function oAuthErr(err, req, res, next) {
  logger.error(err);
  return res.status(err.oauthError).send(err.message);
};
