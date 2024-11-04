const { profile } = require("../controllers");
const { lead } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function profileRoutes(fastify, options) {
    fastify.get(
        "/get-entity-contact-list",
        { preHandler: [authentication, validation] },
        lead.getLeadContactList
    );
    fastify.get(
        "/get-nominee-details",
        { preHandler: [authentication, validation] },
        profile.getNomineeDetails
    );
  }
  
  module.exports = profileRoutes;