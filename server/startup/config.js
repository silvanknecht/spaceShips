/* Configuration*/
const config = require("config");

module.exports = function() {
    /* Check Enviromental Variables*/
    if (!config.get("jwtSecret")) {
      throw new Error("FATAL ERROR: auth_jwtSecret is not defined");
      process.exit(1);
    }
    if (!config.get("oauth.google.clientId")) {
        throw new Error("FATAL ERROR: auth_googleClientId is not defined");
        process.exit(1);
      }
      if (!config.get("oauth.google.clientSecret")) {
        throw new Error("FATAL ERROR: auth_googleClientSecret is not defined");
        process.exit(1);
      }
      if (!config.get("oauth.facebook.clientId")) {
        throw new Error("FATAL auth_facebookClientId is not defined");
        process.exit(1);
      }
      if (!config.get("oauth.facebook.clientSecret")) {
        throw new Error("FATAL ERROR: auth_facebookClientSecret is not defined");
        process.exit(1);
      }
      if (!config.get("oauth.github.clientId")) {
        throw new Error("FATAL ERROR: auth_githubClientId is not defined");
        process.exit(1);
      }
      if (!config.get("oauth.github.clientSecret")) {
        throw new Error("FATAL ERROR: auth_githubClientSecret is not defined");
        process.exit(1);
      }

  };