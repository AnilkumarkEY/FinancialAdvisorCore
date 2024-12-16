const user = require("./user");
const lead = require("./lead");
const contact = require("./contact");
const profile = require("./profile");
const admin = require("./admin");
const search = require("./search");
async function routes(fastify, options) {
  // Register user and lead routes with prefixes
  fastify.register(user, { prefix: "/users" });
  fastify.register(lead, { prefix: "/lead" });
  fastify.register(contact, { prefix: "/contact" });
  fastify.register(profile, { prefix: "/profile" });
  fastify.register(admin, { prefix: "/admin" });
  fastify.register(search, { prefix: "/search" });
}

module.exports = routes;
