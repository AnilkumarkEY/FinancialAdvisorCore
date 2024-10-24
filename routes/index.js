const user = require("./user");
const lead = require("./lead");

async function routes(fastify, options) {
  // Register user and lead routes with prefixes
  fastify.register(user, { prefix: "/users" });
  fastify.register(lead, { prefix: "/lead" });
}

module.exports = routes;
