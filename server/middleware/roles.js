const logger = require("./logger");

function isAdmin(req, res, next) {
  if (req.user.role.includes("admin")) {
    logger.debug("im an admin");
    logger.debug(req.user.roles);
    next(null, req.body);
  } else {
    return res.status(401).send("Unautorized");
  }
}

module.exports.isAdmin = isAdmin;
