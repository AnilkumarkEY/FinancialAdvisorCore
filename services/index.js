const entityService = require("./entity");
const entityContact = require("./entityContact");
const entityUserAuth = require("./entityUserAuth");
const tokenService = require("./tokenService");
const otpService = require("./otp");
const mailService = require("./mail");
const azureBlob = require("./azureBlob");
const agent = require("./agent");

module.exports = {
  entityService,
  entityContact,
  entityUserAuth,
  tokenService,
  otpService,
  mailService,
  azureBlob,
  agent
};
