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
  fastify.put(
    "/update-agent",
    { preHandler: [authentication, validation] },
    admin.updateAgent
  );
  fastify.put(
    "/deactivate-agent",
    { preHandler: [authentication, validation] },
    admin.deleteAgent
  );
}

module.exports = adminRoutes;
