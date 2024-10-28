const user = require("./user");
const lead = require("./lead");
const contact = require("./contact");
async function routes(fastify, options) {
  // Register user and lead routes with prefixes
  fastify.register(user, { prefix: "/users" });
  fastify.register(lead, { prefix: "/lead" });
  fastify.register(contact, { prefix: "/contact" });
}

module.exports = routes;
