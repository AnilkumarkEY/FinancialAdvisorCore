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
    "/getDynamicForms",
    { preHandler: [authentication, validation ] },
    admin.getDynamicForm
  );
  fastify.post(
    "/insertDynamicForms",
    { preHandler: [authentication, validation ] },
    admin.insertDynmicForm
  );
  fastify.put(
    "/updateDynamicForms",
    { preHandler: [authentication, validation ] },
    admin.updateDynamicForm
  );
}

module.exports = adminRoutes;
