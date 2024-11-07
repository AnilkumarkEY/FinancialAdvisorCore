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
  fastify.post(
    "/get-all-products",
    { preHandler: [authentication, validation] },
    lead.getProducts
  );
  fastify.get(
    "/get-lead-tags",
    { preHandler: [authentication, validation] },
    lead.getLeadTags
  );
  fastify.post(
    "/get-locality",
    { preHandler: [authentication, validation] },
    lead.getLocality
  );
  fastify.post(
    "/get-lead-tags-by-id",
    { preHandler: [authentication, validation] },
    lead.getLeadTagsById
  );
  fastify.post(
    "/get-lead-by-id",
    { preHandler: [authentication, validation] },
    lead.getLeadById
  );
  fastify.post(
    "/get-lead-contact-list",
    { preHandler: [authentication, validation] },
    lead.getLeadContactList
  );
}

module.exports = leadRoutes;
