const { admin } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function adminRoutes(fastify, options) {
    fastify.post(
        "/create-agent",
        { preHandler: [authentication, validation] },
        admin.createAgent
    );
  }
  
  module.exports = adminRoutes;