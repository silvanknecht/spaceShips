const bcrypt = require("bcryptjs");

const User = require("../models/user");
const logger = require("../middleware/logger");

module.exports = {
  signUp: async function(req, res, next) {
    try {
      logger.debug("signUp called");

      const { email } = req.body;
      let { password } = req.body;

      const foundUser = await User.findOne({
        email
      });

      if (foundUser && foundUser.methodes.includes("local")) {
        logger.debug("Email already in use");
        return res.status(409).json({
          message: "Email is already in use!"
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passowrdHash = await bcrypt.hash(password, salt); //userpassoword, salt => contains hash and hashedPassword, with that hash can the entered password while login be comapred
      password = passowrdHash;

      existingUser = await User.findOne({ email });

      if (existingUser) {
        logger.debug(
          "Accoutn with same email already excists --> adding Local to User profile!"
        );
        existingUser.methodes.push("local");
        existingUser.local.password = password;
        await existingUser.update(existingUser);

        const token = existingUser.generateAuthToken();
        res.status(200).json({
          token
        });
      } else {
        const newUser = new User({
          methodes: ["local"],
          email,
          local: {
            password: password
          }
        });

        await newUser.save();
        const token = newUser.generateAuthToken();
        res.status(200).json({
          token
        });
      }

      logger.debug("SignUP successful");
    } catch (error) {
      logger.error(error);
      next(false);
    }
  },

  signIn: async function(req, res, next) {
    try {
      logger.debug("signIn called");

      const user = req.user;
      const token = user.generateAuthToken();
      res.status(200).json({
        token
      });

      logger.debug(`SignIn successful`);
    } catch (error) {
      logger.error(error);
      next(false);
    }
  },

  thirdPartyOAuth: async function(req, res, next) {
    try {
      const user = req.user;
      const token = user.generateAuthToken();
      res.status(200).json({
        token
      });
      logger.debug(`thirdPartyOAuth successfull`);
    } catch (error) {
      logger.error(error);
      next(false);
    }
  },

  me: async function(req, res, next) {
    try {
      res.json(req.user);
      logger.debug("Access to me granted!");
    } catch (error) {
      logger.error(error);
      next(false);
    }
  }
};
