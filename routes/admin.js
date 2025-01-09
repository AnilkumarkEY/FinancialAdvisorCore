const { admin } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function adminRoutes(fastify, options) {
    fastify.post(
        "/create-agent",
        { preHandler: [authentication, validation] },
        admin.createAgent
    );
    fastify.post(
        "/user-list",
        { preHandler: [authentication, validation] },
        admin.getUserList
    );
  }
  
  module.exports = adminRoutes;