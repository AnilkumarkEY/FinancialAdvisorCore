const { lead } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function leadRoutes(fastify, options) {
  // Define dashboard routes
  fastify.post(
    "/create-lead",
    { preHandler: [authentication, validation] },
    lead.createLead
  );
  fastify.get(
    "/product-intrested",
    { preHandler: [authentication, validation] },
    lead.prodcutIntrested
  );
  fastify.get(
    "/get-lead-list",
    { preHandler: [authentication, validation] },
    lead.getLeadList
  );
  fastify.get(
    "/get-all-products",
    { preHandler: [authentication, validation] },
    lead.getProducts
  );
}

module.exports = leadRoutes;
