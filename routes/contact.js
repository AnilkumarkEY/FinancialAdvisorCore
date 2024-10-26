const { contact } = require("../controllers");
const { authentication, validation } = require("../middleware");
async function contactRoutes(fastify, options) {
  // Define dashboard routes
  fastify.post(
    "/contact/create-contact",
    { preHandler: [authentication, validation] },
    contact.addEntityContact
  );
  fastify.put(
    "/contact/update-contact",
    { preHandler: [authentication, validation] },
    contact.updateEntityContact
  );
}

module.exports = contactRoutes;
