const entityService = require("./entity");
const entityContact = require("./entityContact");
const entityUserAuth = require("./entityUserAuth");
const tokenService = require("./tokenService");
const otpService = require("./otp");
const mailService = require("./mail");

module.exports = {
  entityService,
  entityContact,
  entityUserAuth,
  tokenService,
  otpService,
  mailService
};
