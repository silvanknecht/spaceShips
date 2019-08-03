const router = require("express-promise-router")();
const passport = require("passport");
require("../middleware/passport");

const oAuthErr = require("../middleware/oAuthErr");
const { validateCredentials, validateNickname } = require("../models/user");
const validate = require("../middleware/validate");
const UsersController = require("../controllers/users");

const passportSignIn = passport.authenticate("local", {
  session: false
});
const passportJWT = passport.authenticate("jwt", {
  session: false
});
const passportGoogle = passport.authenticate("googleToken", {
  session: false
});
const passportFacebook = passport.authenticate("facebookToken", {
  session: false
});
const passportGithub = passport.authenticate("githubToken", {
  session: false
});

// if the validation fails the controller doesn't get called
router.post("/signup", validate(validateCredentials), UsersController.signUp);
router.post(
  "/signin",
  validate(validateCredentials),
  passportSignIn,
  UsersController.signIn
);
router.post(
  "/oauth/google",
  passportGoogle,
  oAuthErr,
  UsersController.thirdPartyOAuth
);
router.post(
  "/oauth/facebook",
  passportFacebook,
  UsersController.thirdPartyOAuth
);
router.post(
  "/oauth/github",
  passportGithub,
  oAuthErr,
  UsersController.thirdPartyOAuth
);
router.put(
  "/nickname",
  validate(validateNickname),
  passportJWT,
  UsersController.nickname
);
router.get("/me", passportJWT, UsersController.me);

module.exports = router;
