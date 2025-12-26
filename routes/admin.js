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
  fastify.get(
    "/dynamic_forms",
    { preHandler: [authentication] },
    admin.getDynamicForm
  );
  fastify.post(
    "/dynamic_forms",
    { preHandler: [authentication] },
    admin.insertDynmicForm
  );
  fastify.put(
    "/dynamic_forms",
    { preHandler: [authentication] },
    admin.updateDynamicForm
  );
}

module.exports = adminRoutes;
